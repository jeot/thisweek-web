import Dexie, { type EntityTable } from 'dexie';
import { DeviceInfo, EncryptionKeyEntry, ItemType } from "@/types/types"

const db = new Dexie('ThisWeekDatabase') as Dexie & {
  items: EntityTable<
    ItemType,
    'id' // primary key "id" (for the typings only)
  >;
  editing: EntityTable<
    { key: 'editing_new' | 'editing_existing'; item: ItemType; },
    'key'
  >;
  deviceInfo: EntityTable<DeviceInfo, 'key'>;
  encryptionKeys: EntityTable<EncryptionKeyEntry, 'id'>;
};

db.version(2).stores({
  items: '++id, uuid, userId, title, type, status, kind, projectId, calendar, scheduledAt, completedAt, tzOffset, tzIANA, dueType, duration, parent, order, notification, pinned, tags, meta, recurrence, createdAt, modifiedAt, deletedAt, version, syncedAt, modifiedBy',
  editing: 'key'
});

db.version(3).stores({
  items: '++id, uuid, userId, title, type, status, kind, projectId, calendar, scheduledAt, completedAt, tzOffset, tzIANA, dueType, duration, parent, order, notification, pinned, tags, meta, recurrence, createdAt, modifiedAt, deletedAt, version, syncedAt, modifiedBy, iv, encrypted',
  editing: 'key',
  deviceInfo: 'key',
  encryptionKeys: 'id' // <- id can be 'local_dek' or user_id
});

db.version(4).upgrade((tx) => {
  return tx.table('items').toCollection().modify(item => {
    item.encrypted = false;
    item.iv = null;
  });
});

// use this for being fast and not async
let cachedDeviceId: string | null = null;

export function getDeviceId(): string {
  if (!cachedDeviceId) {
    console.log("!! no valid cachedDeviceId. should not happen! !!");
    async_initDeviceId();
    return "?!?!";
  }
  return cachedDeviceId;
}

export async function async_initDeviceId(): Promise<string> {
  const dbKey = 'deviceId';

  // Step 1: Check IndexedDB (preferred)
  const stored = await db.deviceInfo.get(dbKey);
  if (stored?.value) {
    cachedDeviceId = stored.value;
    return stored.value;
  }

  // Step 2: Check LocalStorage (legacy fallback)
  const legacyId = localStorage.getItem(dbKey);
  if (legacyId) {
    console.log("!! reading the legacy device uuid !!");
    // Migrate to IndexedDB
    await db.deviceInfo.put({ key: dbKey, value: legacyId });
    cachedDeviceId = legacyId;
    return legacyId;
  }

  // Step 3: Create new and store in IndexedDB
  console.log("!! creating new device uuid !!");
  const newId = crypto.randomUUID();
  await db.deviceInfo.put({ key: dbKey, value: newId });
  cachedDeviceId = newId;
  return newId;
}

export { db };
