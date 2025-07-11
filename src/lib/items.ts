import { ItemType } from "@/types/types";
import { db } from "@/lib/db.ts";
import { getOrCreateDeviceId } from "./db";
import { useWeekState } from "@/store/weekStore";
import { useCalendarState } from "@/store/calendarStore";
import { useAppState } from "@/store/appStore";

// save editing item for temporary edit
async function saveEditingItem(item: ItemType, editingKey: 'editing_new' | 'editing_existing') {
  await db.editing.put({
    key: editingKey,
    item: item,
  });
}

// load editing item for temporary edit
export async function getExistingEdit() { return (await db.editing.get('editing_existing'))?.item || null; }
export async function getNewEdit() { return (await db.editing.get('editing_new'))?.item || null; }

// clear temporary editing item
const clearExistingEdit = async () => await db.editing.delete('editing_existing');
const clearNewEdit = async () => await db.editing.delete('editing_new');

export async function createExistingEditingItem(item: ItemType): Promise<void> {
  try {
    const existingItem = await db.items.get(item.id);
    if (existingItem) {
      saveEditingItem(item, 'editing_existing');
    } else {
      console.log("failed to save exising item! item dont exists!");
    }
  } catch (err) {
    console.log("failed to save exising item:", err);
  }
}

export async function createNewEditingItem(orderingNumber?: number): Promise<void> {
  const newItem = createNewItem(orderingNumber);
  try {
    saveEditingItem(newItem, 'editing_new');
  } catch (error) {
    console.log("Error creating new item. err:", error);
  }
}

export function createNewItem(orderingNumber?: number): ItemType {
  const category = useAppState.getState().pageView === 'This Week' ? 'weekly' : 'project'
  const weekTime = useWeekState.getState().weekReference;
  const calendar = useCalendarState.getState().mainCal.calendar;
  const currentTime = (new Date()).getTime();
  const uuid: string = crypto.randomUUID();
  const tzOffset = new Date().getTimezoneOffset();
  const tzIANA = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  let order = { weekly: 0, project: 0 };
  if (orderingNumber !== undefined) order[category] = orderingNumber;
  const modifiedBy = getOrCreateDeviceId();

  const newItem: ItemType = {
    id: -1,
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
    order: order,

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

export async function saveAsNewItem(item: ItemType) {
  item.modifiedAt = (new Date()).getTime();
  item.modifiedBy = getOrCreateDeviceId();
  console.log("trying to add new item...");
  const { id, ...newItem } = item; // this actually removes the id
  console.log("newItem:", newItem);
  const insertedId = await db.items.add(newItem);
  console.log("add successful. new id: ", insertedId);
  return insertedId;
}

export async function applyEditingItem(item: ItemType) {
  item.version++;
  item.modifiedAt = (new Date()).getTime();
  item.modifiedBy = getOrCreateDeviceId();
  let returnId: number | null = null
  if ((await getExistingEdit())?.id === item.id) {
    try {
      console.log("trying to update existing item...");
      const { id, ...modifiedItem } = item;
      const count = await db.items.update(item.id, modifiedItem);
      if (count) console.log(`update successful`);
      else console.log(`update error: Item not found!`);
      returnId = item.id;
      await clearExistingEdit();
    } catch (error) {
      console.log("Error updating item. err:", error);
    }
  } else if ((await getNewEdit())?.id === item.id) {
    try {
      // type NewItemType = Omit<ItemType, 'id'>;
      console.log("trying to add new item...");
      const { id, ...newItem } = item; // this actually removes the id
      console.log("newItem:", newItem);
      const insertedId = await db.items.add(newItem);
      console.log("add successful. new id: ", insertedId);
      returnId = insertedId;
      await clearNewEdit();
    } catch (error) {
      console.log("Error updating item. err:", error);
    }
  } else {
  }
  return returnId;
}

export async function updateItem(item: ItemType) {
  item.modifiedAt = (new Date()).getTime();
  item.modifiedBy = getOrCreateDeviceId();
  if ((await getExistingEdit())?.id === item.id && (await getExistingEdit())?.uuid === item.uuid) {
    try {
      console.log("updating existingEdit...");
      await saveEditingItem({ ...item }, 'editing_existing');
      console.log("update successful");
    } catch (error) {
      console.log("Error updating. err:", error);
    }
  } else if ((await getNewEdit())?.id === item.id && (await getNewEdit())?.uuid === item.uuid) {
    try {
      console.log("updating newEdit...");
      await saveEditingItem({ ...item }, 'editing_new');
      console.log("update successful");
    } catch (error) {
      console.log("Error updating. err:", error);
    }
  } else { // it's a different item (like clicking a checkbox on todo item)
    try {
      const existingItem = await db.items.get(item.id);
      if (existingItem?.id === item.id && existingItem?.uuid === item.uuid) {
        item.version++;
        console.log("updating existing item...");
        const count = await db.items.update(item.id, { ...item });
        if (count) console.log(`update successful`);
        else console.log(`update error: Item not found!`);
      } else console.log(`update error: invalid item uuid!`);
    } catch (error) {
      console.log("Error updating item. err:", error);
    }
  }
}

export async function cancelEditingItem(item: ItemType) {
  if ((await getExistingEdit())?.id === item.id) {
    console.log("here");
    try {
      clearExistingEdit();
    } catch (error) {
      console.log("Error cancelling existing edit. err:", error);
    }
  } else if ((await getNewEdit())?.id === item.id) {
    try {
      clearNewEdit();
    } catch (error) {
      console.log("Error cancelling new edit. err:", error);
    }
  } else { // this should not happen!
    console.log("Error! this should not happen!");
  }
}

export async function deleteItemHard(item: ItemType) {
  try {
    db.items.delete(item.id)
    console.log("hard delete done");
  } catch (error) {
    console.log("hard delete failed");
  }
}

export async function deleteItem(item: ItemType) {
  // soft delete
  item.deletedAt = (new Date()).getTime();
  const msg = `Soft deleting item...`;
  console.log(msg);
  await updateItem(item);
}

export async function checkEditingIntegrity() {
  const existingEdit = await getExistingEdit();
  const newEdit = await getNewEdit();
  if (existingEdit && newEdit) {
    clearNewEdit();
  }
  if (existingEdit) {
    const existingItem = await db.items.get(existingEdit.id);
    if ((existingItem === undefined) || (existingItem.deletedAt !== null)) {
      clearExistingEdit();
    }
  }
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
