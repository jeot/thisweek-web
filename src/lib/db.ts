import Dexie, { type EntityTable } from 'dexie';
import { ItemType } from "@/types/types"

const db = new Dexie('ThisWeekDatabase') as Dexie & {
  items: EntityTable<
    ItemType,
    'id' // primary key "id" (for the typings only)
  >;
  editing: EntityTable<
    { key: 'editing_new' | 'editing_existing'; item: ItemType; },
    'key'
  >;
};

db.version(2).stores({
  items: '++id, uuid, userId, title, type, status, kind, projectId, calendar, scheduledAt, completedAt, tzOffset, tzIANA, dueType, duration, parent, order, notification, pinned, tags, meta, recurrence, createdAt, modifiedAt, deletedAt, version, syncedAt, modifiedBy',
  editing: 'key'
});

export function getOrCreateDeviceId(): string {
  const key = 'deviceId';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID(); // or any unique string
    localStorage.setItem(key, id);
  }
  return id;
}

export { db };
