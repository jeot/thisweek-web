import { CategoryType, ItemType, OrderType } from "@/types/types";
import { db, getDeviceId } from "@/lib/db.ts";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import { MILLISECONDS_IN_WEEK } from '@/lib/week';

export const UNKNOWN = 'unknown';

type editingKeyType = 'editing_new' | 'editing_existing';

// save editing item for temporary edit
export async function async_saveDraftItem(item: ItemType, editingKey: editingKeyType): Promise<boolean> {
  try {
    await db.editing.put({
      key: editingKey,
      item: item,
    });
    return true;
  } catch (err) {
    console.log("failed to save editing item! err:", err);
    return false;
  }
}

// clear editing item
export async function async_deleteDraftItem(editingKey: editingKeyType): Promise<boolean> {
  try {
    await db.editing.delete(editingKey);
    return true;
  } catch (err) {
    console.log("failed to delete editing item! err:", err);
    return false;
  }
}

// load editing item for temporary edit
export async function async_getDraftItem(editingKey: editingKeyType): Promise<ItemType | null> {
  try {
    const item = (await db.editing.get(editingKey))?.item || null;
    return item;
  } catch (err) {
    console.log("failed to get editing item! err:", err);
    return null;
  }
}

export function createNewItem(orderingNumber?: number, category?: CategoryType): ItemType {
  // todo: use function argument for these states:
  const weekTime = useAppLogic.getState().weekReference;
  const calendar = useCalendarConfig.getState().mainCal.calendar;
  const currentTime = (new Date()).getTime();
  const uuid: string = crypto.randomUUID();
  const tzOffset = new Date().getTimezoneOffset();
  const tzIANA = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  const _category = category ?? 'weekly';
  let ordering: OrderType = {};
  if (orderingNumber !== undefined) ordering[_category] = orderingNumber;
  const modifiedBy = getDeviceId();

  const newItem: ItemType = {
    id: -1,
    uuid: uuid,
    userId: UNKNOWN,

    title: "",
    type: 'todo',
    status: 'undone',
    category: category || 'weekly',
    projectId: null,

    calendar: calendar,
    scheduledAt: weekTime,
    completedAt: null,
    tzOffset: tzOffset,
    tzIANA: tzIANA,
    dueType: null,
    duration: 0,

    parent: null,
    ordering: ordering,
    notification: null,
    pinned: false,
    meta: null,
    recurrence: null,

    iv: null,
    isEncrypted: false,
    ciphertext: "",
    keyVersion: 1,

    createdAt: currentTime,
    modifiedAt: currentTime,
    deletedAt: null,
    version: 1,
    syncedAt: null,
    modifiedBy: modifiedBy,
  };
  return newItem;
}

export function createNewItemFrom(item: ItemType): ItemType {
  const currentTime = (new Date()).getTime();
  const modifiedBy = getDeviceId();
  item.id = -1;
  item.uuid = crypto.randomUUID();
  item.userId = UNKNOWN;
  item.createdAt = currentTime;
  item.modifiedAt = currentTime;
  item.deletedAt = null;
  item.version = 1;
  item.syncedAt = null;
  item.modifiedBy = modifiedBy;
  item.iv = null;
  item.isEncrypted = false;
  item.ciphertext = "";
  item.keyVersion = 1;

  return item;
}

export async function async_getItemsInMillisTimeRange(startUtcMillis: number, endUtcMillis: number): Promise<ItemType[]> {
  try {
    const items = await db.items
      .where('scheduledAt')
      .between(startUtcMillis, endUtcMillis, true, true)
      .and((x) => x.deletedAt === null)
      .and((x) => x.category === 'weekly')
      .sortBy('ordering.weekly');
    return items;
  } catch (err) {
    console.log("error getting items in time range:", err);
    return [];
  }
}

export async function async_checkAndFixOrdering(items: ItemType[]) {
  if (!items.length) return;
  let needOrderingFix = items.some(item => (item.ordering === null) || (item.ordering?.weekly) === undefined || isNaN(item.ordering.weekly) || (item.ordering.weekly >= 1000000) || (item.ordering.weekly <= -1000000));
  if (!needOrderingFix) {
    // check for duplicates
    items.forEach((item, i) => {
      const xi = items.findIndex(x => x.ordering?.weekly === item.ordering?.weekly)
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
        return {
          ...item, ordering: { ...item.ordering, weekly: (index + 1) * 1000.0 }
        };
      });

    await db.items.bulkPut(updated);
    console.log("fix order successful");
  } catch (err) {
    console.log("error while ordering items:", err);
  }
}

export async function async_saveAsNewItem(item: ItemType): Promise<number | null> {
  try {
    console.log("save as new item...");
    const newItemFrom = createNewItemFrom(item);
    const { id, ...newItem } = newItemFrom; // this actually removes the id
    // console.log("new item:", newItem);
    const insertedId = await db.items.add(newItem);
    console.log("add successful. new id: ", insertedId);
    return insertedId;
  } catch (err) {
    console.log("error: ", err);
    return null;
  }
}

export async function async_saveItem(item: ItemType): Promise<boolean> {
  let result = false;
  try {
    item.version++;
    item.modifiedAt = (new Date()).getTime();
    item.modifiedBy = getDeviceId();
    const existingItem = await db.items.get(item.id);
    // strict check of existing item (uuid) for updating
    if (existingItem !== undefined && existingItem.id === item.id && existingItem.uuid === item.uuid) {
      console.log("updating existing item...");
      await db.items.put(item);
      console.log("update successful.");
      result = true;
    } else {
      console.log("error! strict existing/id/uuid check failed!");
    }
  } catch (err) {
    console.log("error save editing item. err:", err);
  }
  return result;
}

export async function async_deleteItemHard(item: ItemType): Promise<boolean> {
  try {
    await db.items.delete(item.id)
    console.log("hard delete done. id:", item.id);
    return true;
  } catch (err) {
    console.log("hard delete failed. err:", err);
    return false;
  }
}

export async function async_deleteItemSoft(item: ItemType): Promise<boolean> {
  try {
    item.deletedAt = (new Date()).getTime();
    console.log("soft deleting item...");
    const result = await async_saveItem(item);
    if (result !== null) return true;
    else return false;
  } catch (err) {
    console.log("soft delete failed. err:", err);
    return false;
  }
}

export async function async_checkDraftIntegrity() {
  const existingDraft = await async_getDraftItem('editing_existing');
  const newDraft = await async_getDraftItem('editing_new');
  if (existingDraft && newDraft) {
    await async_deleteDraftItem('editing_new')
  }
  if (existingDraft) {
    const existingItem = await db.items.get(existingDraft.id);
    if ((existingItem === undefined) || (existingItem.deletedAt !== null)) {
      await async_deleteDraftItem('editing_existing')
    }
  }
}

export async function async_checkUuidIntegrity() {
  const all = await db.items.toArray();

  const seen = new Map<string, any[]>();
  for (const item of all) {
    if (!item.uuid) {
      console.log("error! item has no uuid!!", item);
      continue;
    }
    if (!seen.has(item.uuid)) {
      seen.set(item.uuid, []);
    }
    seen.get(item.uuid)!.push(item);
  }

  // now find duplicates
  const duplicates = Array.from(seen.values()).filter(arr => arr.length > 1);
  if (duplicates.length === 0) return;
  console.log("error! duplicates uuid:", duplicates);
  const flatDuplicates = duplicates.flat();
  const len = flatDuplicates.length;
  for (let i = 1; i < len; i++) {
    const item = flatDuplicates[i];
    item.uuid = crypto.randomUUID();
    await db.items.put(item);
  }
  console.log(`assigned new uuid to ${len} items with duplicate uuids!`);
}

export function getNewOrderingNumber(items: ItemType[], index: number, nextIndex: number, section: 'weekly' | 'project'): number {
  const len = items.length;
  if (len === 0) return 1000;
  const top = (items[0]?.ordering?.[section] || 0) - 1000;
  const bot = (items[len - 1]?.ordering?.[section] || 0) + 1000;
  if (index < 0 || nextIndex < 0) {
    return top;
  }
  if (index >= len || nextIndex >= len) {
    return bot;
  }
  const x = items[index]?.ordering?.[section] || 0;
  const y = items[nextIndex]?.ordering?.[section] || 1000;
  return (x + y) / 2;
}

export async function async_getItemsCount(): Promise<number> {
  try {
    return await db.items.count();
  } catch (err) {
    console.log("error on getting items count. err:", err);
    return 0;
  }
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

export async function async_insertOnboardingTasks() {
  for (const item of list) {
    try {
      let newitem = createNewItem();
      const meta = { onboarding: true }; // for later to avoid syncing! or deleting these items when logged in!
      const currentTime = (new Date()).getTime();
      newitem = {
        ...newitem,
        type: item.type,
        status: item.status,
        title: item.title,
        meta: meta,
        scheduledAt: (currentTime + (item.week * MILLISECONDS_IN_WEEK))
      };
      await async_saveAsNewItem(newitem);
    } catch (err) {
      console.error(`error adding onboarding item ${item.title}:`, err);
    }
  }
}
