import { async_getSyncInfo, async_getUserInfo, async_updatePartialSyncInfo, db } from "./db";
import { ItemType } from "@/types/types";
import { supabase_client } from "./supabase/client";
import { DbInsertItemType, DbItemType, mapDbToItem, mapItemToDbInsert } from "./supabase/mapper";
import { decreaseIsoTime, withTimeout } from "./utils";
import { useDataSyncStore } from "@/store/dataSyncStore";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

// ---- sync functions ----

// pull items from server (pagination by number and ordered by oldest syncedAt time)
async function fetchServerItemsSinceInOrder(since: string, limit: number): Promise<DbItemType[]> {
  const { data: remoteItems, error } = await supabase_client
    .from("items")
    .select()
    .gte("synced_at", since)
    .order("synced_at", { ascending: true })
    .limit(limit);
  if (error !== null) throw error;
  return (remoteItems ?? []);
}

// push local changes
async function pushLocalChangesToServer(changes: ItemType[], uuid: string): Promise<DbItemType[]> {
  if (changes.length === 0) return [];
  // modify some parameters for the server (like userId)
  // note the syncedAt will be update by the server
  const newChanges = changes.map((v) => ({ ...v, userId: uuid }));
  // Strip local-only fields like Dexie id
  const payload: DbInsertItemType[] = newChanges.map(mapItemToDbInsert);
  const { data, error } = await supabase_client
    .from("items")
    .upsert(payload, { onConflict: "uuid" }) // uuid is your sync key
    .select(); // optional: return rows to confirm state

  if (error) throw error;
  return data; // you can use this to update syncedAt in Dexie
}

// mark local items with reflected data that was successfully pushed to server
async function markLocalWithAppliedChanges(changes: DbItemType[]) {
  if (changes.length === 0) return;

  await db.transaction("rw", db.items, async () => {
    for (const change of changes) {
      await db.items.where("uuid").equals(change.uuid).modify({
        syncedAt: change.synced_at,
      });
    }
  });
}

// reconcile items
async function reconcile(serverUpdates: DbItemType[]) {
  const updatesToApply = serverUpdates.map(mapDbToItem);
  await db.transaction("rw", db.items, async () => {
    for (const remote of updatesToApply) {
      // todo: change the modifiedAt to syncedAt
      const { id: _remoteId, ...safeRemote } = remote;
      const local = await db.items.where("uuid").equals(safeRemote.uuid).first();
      const localTime = new Date(local?.modifiedAt || 0).getTime();
      const remoteTime = new Date(safeRemote.modifiedAt).getTime();

      if (!local) {
        // New item from server → add it
        console.log("adding one new remote item to local: ", safeRemote.title);
        await db.items.add(safeRemote); // todo: flash the newly added item?
      } else if (remoteTime > localTime) {
        // Server is newer → overwrite local
        console.log("overwriting one remote item on local: ", local.title, " -> ", safeRemote.title);
        await db.items.put({ ...local, ...safeRemote });
      } else if (localTime > remoteTime) {
        // Local is newer → keep local (will be pushed later)
        // todo: but how?! we should check also synced_at value
        console.log("local is newer, ignoring remote item, marking to be pushed later: ", safeRemote.title);
        await db.items.put({ ...local, syncedAt: null });
      } else {
        console.log("items are in sync! nothing to do!");
      }
    }
  });
  return;
}

async function checkClientIsValid(userUuid: string) {
  const { data, error } = await supabase_client.auth.getSession();
  if (data === null || error !== null) {
    throw new Error("Auth error! sync canceled. no auth data or auth error.");
  }
  if (data !== null && data.session === null) {
    throw new Error("Auth error! sync canceled. no session.");
  }
  if (data !== null && data.session !== null && data.session.user.id !== userUuid) {
    throw new Error("FATAL! Auth error! sync canceled. invalid user id.");
  }
  return true;
}

// note: coudn't wrap my head around this!
// .or("modifiedAt") // note: this should be redundant! the syncedAt === null should be enough
// .above(since)   // changed since last sync
async function getLocalUnsyncedItemsWithLimit(limit: number) {
  const localChanges = await db.items
    .filter(item => item.syncedAt === null) // means never synced or new modification
    .limit(limit)
    .toArray();
  return localChanges;
}

async function getServerTime() {
  // hack! wrap in real Promise
  const rpcPromise = new Promise<PostgrestSingleResponse<string>>((resolve, reject) => {
    supabase_client.rpc("get_server_time")
      .then(resolve, reject)  // resolves the wrapped promise
  });
  const { data, error } = await withTimeout(
    rpcPromise,
    5000 // 5 seconds
  );

  if (error) {
    console.log("error: ", error);
    throw new Error("Failed to fetch. couldn't get server time");
  } else if (data) {
    const mytime = new Date().toISOString();
    console.log("local :", mytime);
    console.log("server:", data);
    return data;
  } else {
    throw new Error("Failed to fetch. couldn't get server time");
  }
}

// run one full sync cycle
export async function runSync() {
  // double check the client id
  const userInfo = await async_getUserInfo();
  const userUuid = userInfo.uuid;
  if (!userUuid) throw new Error("bad userInfo (uuid)!");
  const clientOk = await checkClientIsValid(userUuid);
  if (!clientOk) throw new Error("bad client!");

  useDataSyncStore.getState().setSyncState("idle");
  // 0. Get the last successful remote fetched item sync time
  const syncInfo = await async_getSyncInfo(); // 0 if first time!
  let lastSync = syncInfo.lastRemoteSyncIsoTime;
  console.log("sync: last sync timestamp: ", lastSync);
  // 1. Get the server time (to use as a limit for fetching items)
  const serverTime = await getServerTime();
  console.log("sync: current server time: ", serverTime);

  useDataSyncStore.getState().setSyncState("fetching");
  // --- Remote → Local loop ---
  console.log("SYNC --- Remote → Local loop ---");
  let moreRemote = true;

  while (moreRemote) {
    const LIMIT = 100;
    // 2. Pull new/updated items from server since last sync
    const since = decreaseIsoTime(lastSync, 2); // reducing 2ms for lastSync uncertainty. local is ms, server is us
    console.log("fetching server items since: ", since, ", limit: ", LIMIT);
    const remoteBatch = await fetchServerItemsSinceInOrder(since, LIMIT);
    console.log("fetched remote batch count: ", remoteBatch.length);

    if (remoteBatch.length === 0) {
      moreRemote = false;
      break;
    }

    // Apply this batch locally with conflict resolution
    await reconcile(remoteBatch);

    // Advance cursor: highest synced_at seen
    lastSync = remoteBatch[remoteBatch.length - 1].synced_at;
    if (new Date(lastSync).getTime() < new Date(serverTime).getTime())
      await async_updatePartialSyncInfo({ lastRemoteSyncIsoTime: lastSync });
    else
      await async_updatePartialSyncInfo({ lastRemoteSyncIsoTime: serverTime });

    // If fewer than limit → finished
    if (remoteBatch.length < LIMIT) {
      moreRemote = false;
    }
  }

  // Save the server time as last sync time (safe because time was sent from server)
  await async_updatePartialSyncInfo({ lastRemoteSyncIsoTime: serverTime });

  useDataSyncStore.getState().setSyncState("pushing");
  // --- Local → Remote loop ---
  console.log("SYNC --- Local → Remote loop ---");
  let moreLocal = true;

  while (moreLocal) {

    // 4. Gather local unsynced or updated items
    const LIMIT = 50;
    const localBatch = await getLocalUnsyncedItemsWithLimit(LIMIT);
    console.log("local batch count to push: ", localBatch.length);


    if (localBatch.length === 0) {
      moreLocal = false;
      break;
    }

    try {
      // Push to server (upsert)
      // 5. Push local changes to server (upsert)
      const applied = await pushLocalChangesToServer(localBatch, userUuid);
      console.log("returned data (applied changes: ", applied.length, "): ", applied);

      // 6. Update syncedAt and userId locally for pushed items
      console.log("push successful. marking local items.");
      await markLocalWithAppliedChanges(applied);
    } catch (err) {
      console.error("Failed pushing local batch:", err);
      // Break out, let next sync retry
      moreLocal = false;
    }
  }

  useDataSyncStore.getState().setSyncState("success");
  console.log("sync done.");
}

