import { ItemType } from "@/types/types";
import { db } from "@/lib/db.ts";
import { getOrCreateDeviceId } from "./db";
import { useWeekState } from "@/store/weekStore";
import { useCalendarState } from "@/store/calendarStore";
import { useAppState } from "@/store/appStore";


export type NewItemType = Omit<ItemType, 'id'>;

export function createDefaultNewItem(): NewItemType {
  const category = useAppState.getState().pageView === 'This Week' ? 'weekly' : 'project'
  const weekTime = useWeekState.getState().weekReference;
  const calendar = useCalendarState.getState().mainCal.calendar;
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
    category: category,
    projectId: null,

    calendar: calendar,
    scheduledAt: weekTime,
    completedAt: null,
    tzOffset: tzOffset,
    tzIANA: tzIANA,
    dueType: null,
    duration: 0,

    parent: null,
    order: { weekly: 0, project: 0 },

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

export async function getItemsInWeeklyRange(startUtcMillis: number, endUtcMillis: number) {
  // Query Dexie's API
  try {
    const items = await db.items
      .where('scheduledAt')
      .between(startUtcMillis, endUtcMillis, true, true)
      .and((x) => x.deletedAt === null)
      .sortBy('order.weekly')

    // Return result
    return items;
  } catch (err) {
    console.log("error while query items:", err);
  }
  return [];
}

export async function checkAndFixOrdering(items: ItemType[]) {
  if (!items.length) return;
  let needOrderingFix = items.some(item => (item.order === null) || (item.order?.weekly) === undefined || isNaN(item.order.weekly) || (item.order.weekly >= 1000000) || (item.order.weekly <= -1000000));
  if (!needOrderingFix) {
    // check for duplicates
    items.forEach((item, i) => {
      const xi = items.findIndex(x => x.order.weekly === item.order.weekly)
      if (xi != i) {
        console.log("duplicate ordering found!");
        needOrderingFix = true;
      }
    });
  }
  if (!needOrderingFix) return;
  console.log("this list needs ordering fix...");
  try {
    const updated = items
      .map((item, index) => {
        let newOrder = item.order;
        newOrder.weekly = (index + 1) * 1000.0;
        return {
          ...item,
          order: newOrder
        };
      });

    await db.items.bulkPut(updated);
    console.log("fix order successful");
  } catch (err) {
    console.log("error while ordering items:", err);
  }
}

export async function addNewItem(item: NewItemType) {
  try {
    const id = await db.items.add(item);
    const msg = `Item successfully added. Got id ${id}`;
    console.log(msg);
    return id;
  } catch (error) {
    const msg = `Error adding item. err: ${error}`;
    console.log(msg);
    return null;
  }
}

export async function updateItem(item: ItemType) {
  let modifiedItem: NewItemType = item;
  modifiedItem.version++;
  modifiedItem.modifiedAt = (new Date()).getTime();
  modifiedItem.modifiedBy = getOrCreateDeviceId();
  try {
    const count = await db.items.update(item.id, modifiedItem)
    if (count) console.log(`Item successfully updated`);
    else console.log(`update error: Item not found!`);
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

export async function moveItemToSectionRelative(item: ItemType, offset: number) {
  if (item.category === "weekly") {
    const MILLISECONDS_IN_WEEK = 604800000;
    const newSchedule = item.scheduledAt + (offset * MILLISECONDS_IN_WEEK);
    updateItem({
      ...item,
      scheduledAt: newSchedule,
    });
  }
}

export function getNewOrderingNumber(items: ItemType[], index: number, nextIndex: number, section: 'weekly' | 'project'): number {
  const len = items.length;
  if (len === 0) return 1000;
  const top = items[0]?.order[section] - 1000;
  const bot = items[len - 1]?.order[section] + 1000;
  if (index < 0 || nextIndex < 0) {
    return top;
  }
  if (index >= len || nextIndex >= len) {
    return bot;
  }

  const x = items[index]?.order[section];
  const y = items[nextIndex]?.order[section];
  return (x + y) / 2;
}
