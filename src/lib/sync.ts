import { useEffect, useRef, useState } from "react";
import { async_getSyncInfo, async_updatePartialSyncInfo, db, getUserInfoUuid } from "./db"; // your Dexie instance
import { ItemType } from "@/types/types";
import { supabase_client } from "./supabase/client";
import { DbInsertItemType, DbItemType, mapDbToItem, mapItemToDbInsert } from "./supabase/mapper";

// ---- sync functions ----

// pull items from server (pagination by number and ordered by oldest syncedAt time)
async function fetchServerItemsSinceInOrder(since: number, limit: number): Promise<ItemType[]> {
  const { data: remoteItems, error } = await supabase_client
    .from("items")
    .select()
    .gt("modified_at", since)
    .order("synced_at", { ascending: true })
    .limit(limit);
  if (error !== null) throw error;
  return (remoteItems ?? []).map(mapDbToItem);
}

// push local changes
async function pushLocalChangesToServer(changes: ItemType[]): Promise<DbItemType[]> {
  if (changes.length === 0) return [];
  const currentTime = (new Date()).getTime(); // utc ms
  // modify some parameters for the server
  const newChanges = changes.map((v) => ({ ...v, userId: getUserInfoUuid(), syncedAt: currentTime }));
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
        userId: change.user_id,
        syncedAt: change.synced_at,
      });
    }
  });
}

// reconcile items
async function reconcile(serverUpdates: ItemType[]) {
  await db.transaction("rw", db.items, async () => {
    for (const remote of serverUpdates) {
      // todo: change the modifiedAt to syncedAt
      const { id: _remoteId, ...safeRemote } = remote;
      const local = await db.items.where("uuid").equals(safeRemote.uuid).first();
      if (!local) {
        // New item from server → add it
        console.log("adding one new remote item to local: ", safeRemote.title);
        const insertedId = await db.items.add(safeRemote); // todo: flash the newly added item?
        insertedId;
      } else if (safeRemote.modifiedAt > local.modifiedAt) {
        // Server is newer → overwrite local
        console.log("overwriting one remote item on local: ", local.title, " -> ", safeRemote.title);
        await db.items.put({ ...local, ...safeRemote });
      } else if (local.modifiedAt > safeRemote.modifiedAt) {
        // Local is newer → keep local (will be pushed later)
        // make sure to set the flag for pushing later
        console.log("ignoring one remote item: ", safeRemote.title);
        await db.items.put({ ...local, syncedAt: null });
      } else {
        // console.log("items are in sync! nothing to do!");
      }
    }
  });
  return;
}

async function checkClientIsValid() {
  const { data, error } = await supabase_client.auth.getSession();
  if (data === null || error !== null) {
    throw new Error("sync canceled. no auth session.");
  } else if (data !== null && data.session === null) {
    throw new Error("ERROR!! sync canceled. no session.");
  } else if (data !== null && data.session !== null && data.session.user.id !== getUserInfoUuid()) {
    throw new Error("FATAL ERROR!! sync canceled. invalid user id.");
  } else {
  }
  return true;
}

async function getLocalUnsyncedItemsWithLimit(limit: number) {
  const localChanges = await db.items
    .filter(item => item.syncedAt === null) // means never synced or new modification
    // note: coudn't wrap my head around this!
    // .or("modifiedAt") // note: this should be redundant! the syncedAt === null should be enough
    // .above(since)   // changed since last sync
    .limit(limit)
    .toArray();
  return localChanges;
}


// run one full sync cycle
async function runSync() {
  // double check the client id
  const clientOk = await checkClientIsValid();
  if (!clientOk) return;

  // 1. Get the last successful remote fetched item sync time
  const syncInfo = await async_getSyncInfo(); // 0 if first time!
  let lastSync = syncInfo.lastFetchedItemSyncTime;
  console.log("sync 1. last fetched item sync timestamp: ", lastSync);

  // --- Remote → Local loop ---
  console.log("SYNC --- Remote → Local loop ---");
  let moreRemote = true;

  while (moreRemote) {
    const LIMIT = 100;
    // 2. Pull new/updated items from server since last sync
    console.log("sync 2. pull 100 items from server.");
    const remoteBatch = await fetchServerItemsSinceInOrder(lastSync, LIMIT);
    console.log("remote batch count: ", remoteBatch.length);
    console.log("remote batch: ", remoteBatch);

    if (remoteBatch.length === 0) {
      moreRemote = false;
      break;
    }

    // Apply this batch locally with conflict resolution
    console.log("sync 3. reconcile with local.");
    await reconcile(remoteBatch);

    // Advance cursor: highest modifiedAt seen
    const s = remoteBatch[remoteBatch.length - 1].syncedAt;
    if (s !== null) lastSync = s;
    else console.log("FATAL! synced_at value from server is null.");

    // If fewer than limit → finished
    if (remoteBatch.length < LIMIT) {
      moreRemote = false;
    }
  }

  // Save last successful remote fetched item sync timestamp (watermark)
  // todo: if the lastSync time is in the future,
  // we probably should save it at current time.
  await async_updatePartialSyncInfo({ lastFetchedItemSyncTime: lastSync });

  // --- Local → Remote loop ---
  console.log("SYNC --- Local → Remote loop ---");
  let moreLocal = true;

  while (moreLocal) {

    // 4. Gather local unsynced or updated items
    console.log("sync 4. get local changes.");
    const localBatch = await getLocalUnsyncedItemsWithLimit(20);
    console.log("local batch count: ", localBatch.length);


    if (localBatch.length === 0) {
      moreLocal = false;
      break;
    }

    try {
      // Push to server (upsert)
      // 5. Push local changes to server (upsert)
      console.log("sync 5. push to server.");
      const applied = await pushLocalChangesToServer(localBatch);
      console.log("returned data (applied changes: ", applied.length, "): ", applied);

      // 6. Update syncedAt and userId locally for pushed items
      console.log("sync 6. push successful. marking local items.");
      await markLocalWithAppliedChanges(applied);
    } catch (err) {
      console.error("Failed pushing local batch:", err);
      // Break out, let next sync retry
      moreLocal = false;
    }
  }

  console.log("sync done.");
}

// ---- hook ----
export function useSyncManager() {
  const [syncState, setSyncState] = useState<"idle" | "running" | "error" | "success">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncingRef = useRef(false); // lock to prevent parallel syncs


  // manual trigger with state update
  async function syncNow() {
    return;
    if (syncingRef.current) {
      console.log("Sync already in progress, skipping...");
      return;
    }
    syncingRef.current = true;
    try {
      setSyncState("running");
      await runSync();
      setSyncState("success");
    } catch (err) {
      setSyncState("error");
      console.log("runSync() throw error: ", err);
    } finally {
      syncingRef.current = false; // release lock
    }
  }

  useEffect(() => {
    // start background loop
    console.log("setting the sync timer...");
    timerRef.current = setInterval(() => {
      runSync().catch(err => console.error("Sync error:", err));
    }, 9_000_000); // every 60s: 60_000

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log("sync timer cleared.");
      }
    };
  }, []);

  return { syncNow, syncState };
}


