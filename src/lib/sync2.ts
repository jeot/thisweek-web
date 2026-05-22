import { async_getSyncInfoByKey, async_getUserInfo, async_updatePartialSyncInfoByKey, db } from "./db";
import { ItemType, ProjectType } from "@/types/types";
import { SyncableEntity, SyncRemoteRow, SyncTableKey } from "@/types/syncTypes";
import { supabase_client } from "./supabase/client";
import {
  DbInsertItemType,
  DbInsertProjectType,
  DbItemType,
  DbProjectType,
  mapDbToItem,
  mapDbToProject,
  mapItemToDbInsert,
  mapProjectToDbInsert,
} from "./supabase/mapper";
import { decreaseIsoTime, withTimeout } from "./utils";
import { useDataSyncStore } from "@/store/dataSyncStore";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type SyncLocalTable<TLocal extends SyncableEntity> = {
  where: (index: string) => {
    equals: (value: string) => {
      first: () => Promise<TLocal | undefined>;
      modify: (changes: Partial<TLocal>) => Promise<number>;
    };
  };
  filter: (predicate: (value: TLocal) => boolean) => {
    limit: (limit: number) => {
      toArray: () => Promise<TLocal[]>;
    };
  };
  add: (value: unknown) => Promise<unknown>;
  put: (value: TLocal) => Promise<unknown>;
};

type SyncTableConfig<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
> = {
  syncKey: SyncTableKey;
  remoteTable: string;
  localTable: SyncLocalTable<TLocal>;
  mapRemoteToLocal: (row: TRemote) => TLocal;
  mapLocalToRemoteInsert: (local: TLocal) => TInsert;
  prepareForAdd?: (remote: TLocal) => unknown;
  mergeRemoteIntoLocal?: (local: TLocal, remote: TLocal) => TLocal;
};

const untypedSupabase = supabase_client as unknown as {
  from: (table: string) => any;
};

const itemsConfig: SyncTableConfig<ItemType, DbItemType, DbInsertItemType> = {
  syncKey: "items",
  remoteTable: "items",
  localTable: db.items as unknown as SyncLocalTable<ItemType>,
  mapRemoteToLocal: mapDbToItem,
  mapLocalToRemoteInsert: mapItemToDbInsert,
  prepareForAdd: (remote) => {
    const localInsert = { ...remote } as Partial<ItemType>;
    delete localInsert.id;
    return localInsert;
  },
  mergeRemoteIntoLocal: (local, remote) => ({
    ...local,
    ...remote,
    id: local.id,
  }),
};

const projectsConfig: SyncTableConfig<ProjectType, DbProjectType, DbInsertProjectType> = {
  syncKey: "projects",
  remoteTable: "projects",
  localTable: db.projects as unknown as SyncLocalTable<ProjectType>,
  mapRemoteToLocal: mapDbToProject,
  mapLocalToRemoteInsert: mapProjectToDbInsert,
};

async function fetchServerRowsSinceInOrder<TRemote extends SyncRemoteRow>(
  config: SyncTableConfig<SyncableEntity, TRemote, unknown>,
  since: string,
  limit: number,
): Promise<TRemote[]> {
  const { data, error } = await untypedSupabase
    .from(config.remoteTable)
    .select()
    .gte("synced_at", since)
    .order("synced_at", { ascending: true })
    .limit(limit);

  if (error !== null) throw error;
  return (data ?? []) as TRemote[];
}

async function pushLocalChangesToServer<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
>(
  config: SyncTableConfig<TLocal, TRemote, TInsert>,
  changes: TLocal[],
  userUuid: string,
): Promise<TRemote[]> {
  if (changes.length === 0) return [];

  const payload = changes.map((local) =>
    config.mapLocalToRemoteInsert({ ...local, userId: userUuid })
  );

  const { data, error } = await untypedSupabase
    .from(config.remoteTable)
    .upsert(payload, { onConflict: "uuid" })
    .select();

  if (error !== null) throw error;
  return (data ?? []) as TRemote[];
}

async function markLocalWithAppliedChanges<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
>(
  config: SyncTableConfig<TLocal, TRemote, TInsert>,
  changes: TRemote[],
) {
  if (changes.length === 0) return;

  await db.transaction("rw", config.localTable as any, async () => {
    for (const change of changes) {
      await config.localTable.where("uuid").equals(change.uuid).modify({
        userId: change.user_id,
        syncedAt: change.synced_at,
      } as Partial<TLocal>);
    }
  });
}

async function reconcile<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
>(
  config: SyncTableConfig<TLocal, TRemote, TInsert>,
  serverUpdates: TRemote[],
) {
  const updatesToApply = serverUpdates.map(config.mapRemoteToLocal);

  await db.transaction("rw", config.localTable as any, async () => {
    for (const remote of updatesToApply) {
      const local = await config.localTable.where("uuid").equals(remote.uuid).first();
      const localTime = new Date(local?.modifiedAt || 0).getTime();
      const remoteTime = new Date(remote.modifiedAt).getTime();

      if (!local) {
        console.log(`adding one new remote ${config.syncKey} row to local: `, remote.uuid);
        await config.localTable.add(config.prepareForAdd ? config.prepareForAdd(remote) : remote);
      } else if (remoteTime > localTime) {
        console.log(`overwriting one remote ${config.syncKey} row on local: `, remote.uuid);
        const nextLocal = config.mergeRemoteIntoLocal
          ? config.mergeRemoteIntoLocal(local, remote)
          : { ...local, ...remote };
        await config.localTable.put(nextLocal);
      } else if (localTime > remoteTime) {
        console.log(`local ${config.syncKey} row is newer, marking to push later: `, remote.uuid);
        await config.localTable.put({ ...local, syncedAt: null });
      } else {
        console.log(`${config.syncKey} row is already in sync: `, remote.uuid);
      }
    }
  });
}

async function checkClientIsValid(userUuid: string) {
  const { data, error } = await supabase_client.auth.getSession();
  if (data === null || error !== null) {
    throw new Error("Auth error! sync canceled. no auth data or auth error.");
  }
  if (data.session === null) {
    throw new Error("Auth error! sync canceled. no session.");
  }
  if (data.session.user.id !== userUuid) {
    throw new Error("FATAL! Auth error! sync canceled. invalid user id.");
  }
  return true;
}

async function getLocalUnsyncedWithLimit<TLocal extends SyncableEntity>(
  config: SyncTableConfig<TLocal, SyncRemoteRow, unknown>,
  limit: number,
) {
  return config.localTable
    .filter((row) => row.syncedAt === null)
    .limit(limit)
    .toArray();
}

async function getServerTime() {
  const rpcPromise = new Promise<PostgrestSingleResponse<string>>((resolve, reject) => {
    supabase_client.rpc("get_server_time").then(resolve, reject);
  });
  const { data, error } = await withTimeout(rpcPromise, 5000);

  if (error) {
    console.log("error: ", error);
    throw new Error("Failed to fetch. couldn't get server time");
  }
  if (!data) {
    throw new Error("Failed to fetch. couldn't get server time");
  }
  console.log("local :", new Date().toISOString());
  console.log("server:", data);
  return data;
}

function minIsoTime(a: string, b: string) {
  return new Date(a).getTime() < new Date(b).getTime() ? a : b;
}

async function pullRemoteChanges<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
>(
  config: SyncTableConfig<TLocal, TRemote, TInsert>,
  serverTime: string,
) {
  const syncInfo = await async_getSyncInfoByKey(config.syncKey);
  let lastSync = syncInfo.lastRemoteSyncIsoTime;
  let moreRemote = true;

  while (moreRemote) {
    const limit = 100;
    const since = decreaseIsoTime(lastSync, 2);
    console.log(`fetching server ${config.syncKey} since: `, since, ", limit: ", limit);
    const remoteBatch = await fetchServerRowsSinceInOrder(
      config as unknown as SyncTableConfig<SyncableEntity, TRemote, unknown>,
      since,
      limit,
    );
    console.log(`fetched remote ${config.syncKey} batch count: `, remoteBatch.length);

    if (remoteBatch.length === 0) {
      moreRemote = false;
      break;
    }

    await reconcile(config, remoteBatch);

    lastSync = remoteBatch[remoteBatch.length - 1].synced_at;
    await async_updatePartialSyncInfoByKey(config.syncKey, {
      lastRemoteSyncIsoTime: minIsoTime(lastSync, serverTime),
    });

    if (remoteBatch.length < limit) {
      moreRemote = false;
    }
  }

  await async_updatePartialSyncInfoByKey(config.syncKey, {
    lastRemoteSyncIsoTime: serverTime,
  });
}

async function pushLocalChanges<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
>(
  config: SyncTableConfig<TLocal, TRemote, TInsert>,
  userUuid: string,
) {
  let moreLocal = true;

  while (moreLocal) {
    const limit = 50;
    const localBatch = await getLocalUnsyncedWithLimit(
      config as SyncTableConfig<TLocal, SyncRemoteRow, unknown>,
      limit,
    );
    console.log(`local ${config.syncKey} batch count to push: `, localBatch.length);

    if (localBatch.length === 0) {
      moreLocal = false;
      break;
    }

    const applied = await pushLocalChangesToServer(config, localBatch, userUuid);
    console.log(`returned applied ${config.syncKey} changes count: `, applied.length);
    await markLocalWithAppliedChanges(config, applied);
  }
}

async function syncTable<
  TLocal extends SyncableEntity,
  TRemote extends SyncRemoteRow,
  TInsert,
>(
  config: SyncTableConfig<TLocal, TRemote, TInsert>,
  userUuid: string,
  serverTime: string,
) {
  console.log(`SYNC ${config.syncKey} --- Remote -> Local loop ---`);
  useDataSyncStore.getState().setSyncState("fetching");
  await pullRemoteChanges(config, serverTime);

  console.log(`SYNC ${config.syncKey} --- Local -> Remote loop ---`);
  useDataSyncStore.getState().setSyncState("pushing");
  await pushLocalChanges(config, userUuid);
}

export async function runSync2() {
  console.log("===== sync2 started.");
  const userInfo = await async_getUserInfo();
  const userUuid = userInfo.uuid;
  if (!userUuid) throw new Error("bad userInfo (uuid)!");

  const clientOk = await checkClientIsValid(userUuid);
  if (!clientOk) throw new Error("bad client!");

  useDataSyncStore.getState().setSyncState("idle");
  const serverTime = await getServerTime();

  try {
    await syncTable(projectsConfig, userUuid, serverTime);
  } catch (err) {
    console.error("Error syncing projects table:", err);
  }
  try {
    await syncTable(itemsConfig, userUuid, serverTime);
  } catch (err) {
    console.error("Error syncing items table:", err);
  }

  useDataSyncStore.getState().setSyncState("success");
  console.log("===== sync2 done.");
}
