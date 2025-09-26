import Dexie, { type EntityTable } from 'dexie';
import { DeviceInfo, EncryptionKeyEntry, ItemType, SyncInfo, UserInfo } from "@/types/types"

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
  syncInfo: EntityTable<SyncInfo, 'key'>;
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

// ChatGPT: Dexie will keep all the previous definitions (items, editing, deviceInfo, userInfo, encryptionKeys)
// from v8 and just add syncInfo.
db.version(9).stores({
  syncInfo: 'key'
});

db.version(10).upgrade((tx) => {
  console.log("dexie upgrade to v10...");
  return tx.table('items').toCollection().modify(item => {
    item.userId = null;
    item.projectId = null;
    item.ciphertext = null;
    item.ordering = item.order ? { ...item.order } : { weekly: 0, project: 0 };
    delete item.order; // remove the 'order' key if it exists
    const convertToISO = (value: number | string | null | undefined) => {
      if (value == null) return null; // preserve null
      if (typeof value === 'number') return new Date(value).toISOString();
      if (typeof value === 'string') return value; // already ISO string
      return null;
    };
    item.scheduledAt = convertToISO(item.scheduledAt);
    item.completedAt = convertToISO(item.completedAt);
    item.createdAt = convertToISO(item.createdAt);
    item.modifiedAt = convertToISO(item.modifiedAt);
    item.deletedAt = convertToISO(item.deletedAt);
    item.syncedAt = convertToISO(item.syncedAt);
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

const DEFAULT_SYNCINFO: SyncInfo = {
  key: 'syncinfo',
  lastRemoteSyncIsoTime: '1985-10-26T08:21:00.000Z'
}

export async function async_getSyncInfo(): Promise<SyncInfo> {
  try {
    const stored = await db.syncInfo.get('syncinfo');
    if (stored) {
      return { ...DEFAULT_SYNCINFO, ...stored };
    } else {
      await db.syncInfo.put(DEFAULT_SYNCINFO);
      return DEFAULT_SYNCINFO;
    }
  } catch (err) {
    console.log("catch error: ", err);
    return DEFAULT_SYNCINFO;
  }
}

export async function async_updatePartialSyncInfo(update: Partial<Omit<SyncInfo, 'key'>>) {
  await db.syncInfo.update('syncinfo', update);
}

export { db };
