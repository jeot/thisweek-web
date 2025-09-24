import { useEffect, useRef, useState } from "react";
import { db, getUserInfoUuid } from "./db"; // your Dexie instance
import { ItemType } from "@/types/types";
import { supabase_client } from "./supabase/client";
import { mapDbToItem } from "./supabase/mapper";
import { UNKNOWN } from "./items";

// ---- sync functions ----

// pull items from server
async function fetchServerItemsSince(since: number | null): Promise<ItemType[]> {
  const userId = getUserInfoUuid() || UNKNOWN;
  const { data: remoteItems, error } = await supabase_client
    .from('items')
    .select()
    .eq('user_id', userId) // should not need because of the RLS
    .gt('modified_at', since);
  if (error !== null) throw error;
  return (remoteItems ?? []).map(mapDbToItem);
}

// push local changes
async function pushLocalChangesToServer(changes: ItemType[]) {
  changes;
  // TODO: replace with your API call
  return false;
}

// reconcile items
async function reconcile(serverUpdates: ItemType[]) {
  // TODO: merge logic, handle conflicts, etc.
  await db.transaction("rw", db.items, async () => {
    for (const remote of serverUpdates) {
      const local = await db.items.where("uuid").equals(remote.uuid).first();

      // todo: change the modifiedAt to syncedAt
      if (!local) {
        // New item from server → add it
        await db.items.add(remote);
      } else if (remote.modifiedAt > local.modifiedAt) {
        // Server is newer → overwrite local
        await db.items.put({ ...local, ...remote });
      } else if (local.modifiedAt > remote.modifiedAt) {
        // Local is newer → keep local (will be pushed later)
        continue;
      }
    }
  });
  return;
}

// run one full sync cycle
async function runSync() {
  // 1. Get last successful sync timestamp (max syncedAt where not null)
  console.log("sync 1. get last sync timestamp.");
  const lastSync = await db.items
    .filter(item => item.syncedAt !== null)
    .toArray()
    .then(items => items.length ? Math.max(...items.map(i => i.syncedAt!)) : 0);
  console.log("last sync: ", lastSync);

  // 2. Pull new/updated items from server since last sync
  console.log("sync 2. pull from server.");
  const serverUpdates = await fetchServerItemsSince(lastSync);
  console.log("remote change count: ", serverUpdates.length);
  console.log("serverUpdates: ", serverUpdates);

  // 3. Apply server updates locally (conflict resolution: last-modified-wins)
  console.log("sync 3. reconcile with local.");
  await reconcile(serverUpdates);

  // 4. Gather local unsynced or updated items
  console.log("sync 4. get local changes.");
  const localChanges = await db.items
    .filter(item => item.syncedAt === null) // means never synced
    .or("modifiedAt") // todo: maybe use syncedAt?
    .above(lastSync)   // changed since last sync
    .toArray();
  console.log("local change count: ", localChanges.length);

  // 5. Push local changes to server
  console.log("sync 5. push to server.");
  const pushSuccess = await pushLocalChangesToServer(localChanges);

  // 6. Update syncedAt locally for pushed items
  if (pushSuccess) {
    console.log("sync 6. update local sync timestamp.");
    const now = Date.now(); // todo: user server time
    await db.items.bulkPut(
      localChanges.map(item => ({ ...item, syncedAt: now }))
    );
  } else {
    console.log("push to server failed");
  }
}

// ---- hook ----
export function useSyncManager() {
  const [syncState, setSyncState] = useState<"idle" | "running" | "error" | "success">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // manual trigger with state update
  async function syncNow() {
    try {
      setSyncState("running");
      await runSync();
      setSyncState("success");
    } catch (err) {
      setSyncState("error");
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


