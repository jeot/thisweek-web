import { ItemType } from "@/types/types";
import { db } from "@/lib/db.ts";
import { getOrCreateDeviceId } from "./db";
import { CalendarType } from "@/types/calendarLocales";

type NewItemType = Omit<ItemType, 'id'>;

export function createDefaultNewItem(): NewItemType {
  const currentTime = (new Date()).getTime();
  const uuid: string = crypto.randomUUID();
  const tzOffset = new Date().getTimezoneOffset();
  const tzIANA = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  const modifiedBy = getOrCreateDeviceId();

  const newItem: Omit<ItemType, 'id'> = {
    uuid: uuid,
    userId: null,

    title: "",
    type: 'todo',
    status: 'undone',
    category: 'weekly',
    projectId: null,

    calendar: 'gregory',
    scheduledAt: currentTime,
    completedAt: null,
    tzOffset: tzOffset,
    tzIANA: tzIANA,
    dueType: null,
    duration: 0,

    parent: null,
    order: {},

    notification: null,
    pinned: false,
    tags: [],
    meta: null,
    recurrence: null,

    createdAt: currentTime,
    modifiedAt: currentTime,
    deletedAt: null,
    version: 1,
    syncedAt: null,
    modifiedBy: modifiedBy,
  };

  return newItem;
}

export async function addNewItem(title: string, type: 'todo' | 'note', calendar: CalendarType, scheduledAt: number) {
  try {
    let defaultNewItem = createDefaultNewItem();
    const id = await db.items.add({
      ...defaultNewItem,
      title: title,
      type: type,
      calendar: calendar,
      scheduledAt: scheduledAt,
    });
    const msg = `Item successfully added. Got id ${id}`;
    console.log(msg);
  } catch (error) {
    const msg = `Error adding item. err: ${error}`;
    console.log(msg);
  }
}

export async function updateItem(item: ItemType) {
  let modifiedItem: NewItemType = item;
  modifiedItem.version++;
  modifiedItem.modifiedAt = (new Date()).getTime();
  modifiedItem.modifiedBy = getOrCreateDeviceId();
  try {
    const id = await db.items.update(item.id, modifiedItem)
    const msg = `Item successfully updated. Got id ${id}`;
    console.log(msg);
  } catch (error) {
    const msg = `Error updating item. err: ${error}`;
    console.log(msg);
  }
}

export async function deleteItem(item: ItemType) {
  /* hard delete:
  db.items.delete(item.id).then(() => { console.log("hard delete done") }).catch(() => { console.log("hard delete failed") });
  */
  // soft delete:
  item.deletedAt = (new Date()).getTime();
  const msg = `Soft deleting item...`;
  console.log(msg);
  await updateItem(item);
}
