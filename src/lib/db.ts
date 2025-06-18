import Dexie, { type EntityTable } from 'dexie';
import { ItemType } from "@/types/types"

const db = new Dexie('FriendsDatabase') as Dexie & {
  items: EntityTable<
    ItemType,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  items: '++id, title, state' // primary key "id" (for the runtime!)
});

export { db };
