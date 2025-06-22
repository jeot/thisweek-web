import Dexie, { type EntityTable } from 'dexie';
import { ItemType } from "@/types/types"

const db = new Dexie('FriendsDatabase') as Dexie & {
  items: EntityTable<
    ItemType,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema version 1:
db.version(1).stores({
  items: '++id, title, state' // primary key "id" (for the runtime!)
});

// Schema version 2:
db.version(2).stores({
  items: '++id, title, type, state'
});

// Schema version 3:
db.version(3).stores({
  items: '++id, title, type, state'
}).upgrade(tx => {
  return tx.table('items').toCollection().modify(item => {
    item.type = item.type === undefined ? 'todo' : item.type;
  });
});

export { db };
