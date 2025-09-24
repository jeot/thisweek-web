import Dexie, { type EntityTable } from 'dexie';
import { DeviceInfo, EncryptionKeyEntry, ItemType, UserInfo } from "@/types/types"

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
  userInfo: EntityTable<UserInfo, 'key'>;
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
    // item.encrypted = false; // changed the name in db.version(5)
    item.iv = null;
  });
});

db.version(5).upgrade((tx) => {
  return tx.table('items').toCollection().modify(item => {
    item.isEncrypted = false;
    item.ciphertext = "";
    item.keyVersion = 1;
  });
});

db.version(6).stores({
  items: '++id, uuid, userId, type, status, category, projectId, scheduledAt, completedAt, pinned, modifiedAt, deletedAt, syncedAt, modifiedBy, isEncrypted, tags*',
  editing: 'key',
  deviceInfo: 'key',
  encryptionKeys: 'id'
});

db.version(7).stores({
  items: '++id, uuid, userId, type, status, category, projectId, scheduledAt, completedAt, pinned, version, modifiedAt, deletedAt, syncedAt, modifiedBy, isEncrypted',
  editing: 'key',
  deviceInfo: 'key',
  userInfo: 'key',
  encryptionKeys: 'id'
});

db.version(8).stores({
  items: '++id, uuid, userId, type, status, category, projectId, scheduledAt, completedAt, pinned, version, modifiedAt, deletedAt, syncedAt, modifiedBy, isEncrypted',
  editing: 'key',
  deviceInfo: 'key',
  userInfo: 'key',
  encryptionKeys: 'id'
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

// use this for being fast and not async
let cachedUserInfoUuid: string | null = null;

export function getUserInfoUuid(): string | null {
  return cachedUserInfoUuid;
}

export async function async_initUserInfoUuid(): Promise<string | null> {
  const stored = await db.userInfo.get('uuid');
  if (stored?.value) {
    cachedUserInfoUuid = stored.value;
    return stored.value;
  } else {
    cachedUserInfoUuid = null;
    return null;
  }
}

export async function async_newUserInfoUuid(newUuid: string): Promise<void> {
  let oldUserUuid = await async_initUserInfoUuid();
  if (oldUserUuid === newUuid) {
    console.log("!! same user info !!");
  } else {
    console.log("!! creating new user info with logged-in user uuid !!");
  }
  await db.userInfo.put({ key: 'uuid', value: newUuid });
  cachedUserInfoUuid = newUuid;
}

export { db };
