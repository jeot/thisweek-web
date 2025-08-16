import { ItemType } from "@/types/types";
import { db, getDeviceId } from "@/lib/db.ts";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import { MILLISECONDS_IN_WEEK } from '@/lib/week';

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
  // todo: use function argument for these states:
  const category = useAppLogic.getState().pageView === 'This Week' ? 'weekly' : 'project'
  const weekTime = useAppLogic.getState().weekReference;
  const calendar = useCalendarConfig.getState().mainCal.calendar;
  const currentTime = (new Date()).getTime();
  const uuid: string = crypto.randomUUID();
  const tzOffset = new Date().getTimezoneOffset();
  const tzIANA = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  let order = { weekly: 0, project: 0 };
  if (orderingNumber !== undefined) order[category] = orderingNumber;
  const modifiedBy = getDeviceId();

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
    iv: null,
    encrypted: false,
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
      .and((x) => x.category === 'weekly')
      .sortBy('order.weekly')

    await checkAndFixOrdering(items);

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
  item.modifiedBy = getDeviceId();
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
  item.modifiedBy = getDeviceId();
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
      console.log("trying to add new item...");
      const { id, ...newItem } = item; // this actually removes the id
      // fix the new item date and time
      // todo: this should be by the caller of the function!
      const weekTime = useAppLogic.getState().weekReference;
      newItem.scheduledAt = weekTime;
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
  item.modifiedBy = getDeviceId();
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
        console.log("updating existing item..., id: ", item.id);
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

export async function getItemsCount(): Promise<number> {
  return await db.items.count();
}

const list: Array<{
  id: number;
  title: string;
  week: number;
  type: 'todo' | 'note';
  status: 'done' | 'undone' | 'pending' | 'blocked' | 'canceled';
}> = [
    { id: 0, type: 'todo', status: 'undone', week: 0, title: "Check me off. ✅" },
    { id: 0, type: 'note', status: 'undone', week: 0, title: "No need to delete tasks. They stay in your weekly history." },
    { id: 0, type: 'note', status: 'undone', week: 0, title: "What is the most important thing you have to do this week?" },
    { id: 0, type: 'todo', status: 'undone', week: 0, title: "🚩 Add your first task. Tap “New Item” and plan something for this week." },
    { id: 0, type: 'note', status: 'undone', week: 0, title: "Use ⬆️ ⬇️ for item selection, ⬅️ ➡️ for navigating other weeks." },
    { id: 0, type: 'todo', status: 'undone', week: 0, title: "✏️ Edit this task. Select and press “Enter” to start editing." },
    { id: 0, type: 'note', status: 'undone', week: 1, title: "Here is your next week!" },
    { id: 0, type: 'todo', status: 'undone', week: 1, title: "Do one workout session this week. 💪" },
    { id: 0, type: 'note', status: 'undone', week: 1, title: "Visit the Keymaps section in Settings for all keyboard shortcuts. ⌨️" },
  ];

export async function insertOnboardingTasks() {
  list.forEach((item) => {
    let newitem = createNewItem();
    const meta = { onboarding: true }; // for later to avoid syncing! or deleting these items when logged in!
    newitem = { ...newitem, type: item.type, status: item.status, title: item.title, meta: meta, scheduledAt: (new Date()).getTime() + (item.week * MILLISECONDS_IN_WEEK) };
    saveAsNewItem(newitem);
  });
}
