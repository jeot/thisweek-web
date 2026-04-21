import { CategoryType, ItemType, OrderType, ProjectType } from "@/types/types";
import { db, getDeviceId } from "@/lib/db.ts";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import { timeToISO } from "./utils";
import { getWeekdayNumber } from "./week";

const ORDERING_STEP = 100000;
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

export function createNewItem(category: CategoryType, orderingNumber?: number): ItemType {
  // todo: use function argument for these states:
  const schedule = useAppLogic.getState().weekReference;
  const calendar = useCalendarConfig.getState().mainCal.calendar;
  const currentTime = timeToISO();
  const uuid: string = crypto.randomUUID();
  const tzOffset = new Date().getTimezoneOffset();
  const tzIANA = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  let ordering: OrderType = {};
  if (orderingNumber !== undefined) ordering[category] = orderingNumber;
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
    scheduledAt: schedule,
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
    ciphertext: null,
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
  const currentTime = timeToISO();
  const modifiedBy = getDeviceId();
  item.id = -1;
  item.uuid = crypto.randomUUID();
  item.userId = null;
  item.createdAt = currentTime;
  item.modifiedAt = currentTime;
  item.deletedAt = null;
  item.version = 1;
  item.syncedAt = null;
  item.modifiedBy = modifiedBy;
  item.iv = null;
  item.isEncrypted = false;
  item.ciphertext = null;
  item.keyVersion = 1;
  return item;
}

export function createNewProjectType(title: string | null, uuid: string | null = null): ProjectType {
  const currentTime = timeToISO();
  const modifiedBy = getDeviceId();
  let version = 1;
  if (uuid !== null) version = 0;
  const project: ProjectType = {
    uuid: uuid || crypto.randomUUID(),
    title: title || "Hello world!",
    userId: null,
    parent: null,
    ordering: 100,
    pinned: false,
    meta: null,
    iv: null,
    isEncrypted: false,
    ciphertext: null,
    keyVersion: 1,
    createdAt: currentTime,
    modifiedAt: currentTime,
    deletedAt: null,
    version: version,
    syncedAt: null,
    modifiedBy: modifiedBy,
  };
  return project;
}

export async function async_getUnsyncedItemsCount(): Promise<number> {
  try {
    const unsyncedCount = await db.items
      .filter(item => item.syncedAt === null) // means never synced or new modification
      .count();
    return unsyncedCount;
  } catch (err) {
    console.log("error getting unsynced items count:", err);
    return 0;
  }
}

export async function async_getProjects(): Promise<ProjectType[]> {
  try {
    const projects = await db.projects
      .toArray(); // pull array first

    const sorted = projects
      .filter((p) => p.deletedAt === null)
      .sort((a, b) => {
        const aVal = a.ordering ?? 0;
        const bVal = b.ordering ?? 0;
        return aVal - bVal;
      });

    return sorted;
  } catch (err) {
    console.log("error getting list of project:", err);
    return [];
  }
}

export async function async_getItemsInProject(projectUuid: string | null): Promise<ItemType[]> {
  try {
    if (projectUuid === null) return [];
    const items = await db.items
      .where('projectId')
      .equals(projectUuid)
      .and((x) => x.deletedAt === null)
      .and((x) => x.category === 'project')
      .toArray(); // pull array first

    // we have to sort this. because appLogic selection indexing works based on this
    const sorted = items.sort((a, b) => {
      const aVal = a.ordering?.project ?? 0;
      const bVal = b.ordering?.project ?? 0;
      return aVal - bVal;
    });

    return sorted;
  } catch (err) {
    console.log("error getting items in project:", err);
    return [];
  }
}

export async function async_getItemsInUtcIsoTimeRange(startUtcIso: string, endUtcIso: string): Promise<ItemType[]> {
  try {
    const items = await db.items
      .where('scheduledAt')
      .between(startUtcIso, endUtcIso, true, true)
      .and((x) => x.deletedAt === null)
      .and((x) => x.category === 'weekly')
      .toArray(); // pull array first

    // we have to sort this. because appLogic selection indexing works based on this
    const sorted = items.sort((a, b) => {
      const aVal = a.ordering?.weekly ?? 0;
      const bVal = b.ordering?.weekly ?? 0;
      return aVal - bVal;
    });

    return sorted;
  } catch (err) {
    console.log("error getting items in time range:", err);
    return [];
  }
}

export async function async_checkAndFixOrdering(items: ItemType[], category: CategoryType) {
  if (!items.length) return;
  let needOrderingFix = items.some(item =>
    (item.ordering === null)
    || (item.ordering?.[category] === undefined)
    || isNaN(item.ordering[category])
    || (item.ordering[category] >= (10000 * ORDERING_STEP))
    || (item.ordering[category] <= -(10000 * ORDERING_STEP)));

  if (!needOrderingFix) {
    // check for duplicates
    items.forEach((item, i) => {
      const xi = items.findIndex(x => x.ordering?.[category] === item.ordering?.[category])
      if (xi != i) {
        console.log("duplicate ordering found!");
        needOrderingFix = true;
      }
    });
  }
  if (!needOrderingFix) return;
  console.log("this list needs ordering fix...");
  try {
    const ORDER_SHIFT = getOrderingShiftBasedOnStartWeekday();
    const updated = items
      .map((item, index) => {
        let newOrdering = { ...item.ordering };
        if (category === "weekly") newOrdering.weekly = ((index + 1) * ORDERING_STEP) + ORDER_SHIFT;
        if (category === "project") newOrdering.project = ((index + 1) * ORDERING_STEP) + ORDER_SHIFT;
        return {
          ...item,
          ordering: { ...newOrdering },
          version: item.version + 1,
          modifiedBy: getDeviceId(),
          modifiedAt: timeToISO(), // this is a must for between device syncing
          syncedAt: null, // would sync in next run
        };
      });

    await db.items.bulkPut(updated);
    console.log("fix order successful");
  } catch (err) {
    console.log("error while ordering items:", err);
  }
}

function getOrderingShiftBasedOnStartWeekday() {
  const startWeekday = useCalendarConfig.getState().mainCal.weekStartsOn;
  const ORDER_SHIFT = getWeekdayNumber(startWeekday) * ORDERING_STEP / 100;
  return ORDER_SHIFT;
}

export async function async_createNewProject(title: string, uuid: string | null = null): Promise<string | null> {
  try {
    if (uuid) console.log("create missing project with uuid: ", uuid);
    else console.log("create new project...");
    const newProject = createNewProjectType(title, uuid);
    console.log("project:", newProject);
    const insertedUuid = await db.projects.add(newProject);
    console.log("project creation successful. uuid: ", insertedUuid);
    return insertedUuid;
  } catch (err) {
    console.log("error: ", err);
    return null;
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
    item.modifiedAt = timeToISO();
    item.modifiedBy = getDeviceId();
    item.syncedAt = null;
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
    item.deletedAt = timeToISO();
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
  if (duplicates.length === 0) {
    console.log("Items Integrity OK. ✅");
    return;
  }
  console.log("Items Integrity failed. ❌");
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

export async function async_checkProjectsIntegrity() {
  const allProjectItems = await db.items
    .where('category')
    .equals("project")
    .toArray();
  // console.log("all projects items:", allProjectItems);

  const allProjects = await db.projects.toArray();
  // console.log("all projects:", allProjects);

  const missingProjects = new Map<string, ItemType[]>();
  for (const item of allProjectItems) {
    let missing = true;
    for (const project of allProjects) {
      if (project.uuid === item.projectId) {
        missing = false;
        break;
      }
    }
    if (item.projectId === null) {
      /* note: for now, we don't care about the null prjects
      //console.log("item with null project ref:", item);
      if (!missingProjects.has("null")) {
        missingProjects.set("null", []);
      }
      missingProjects.get("null")!.push(item);
      */
    } else if (missing) {
      // console.log("project missing:", item.projectId);
      if (!missingProjects.has(item.projectId)) {
        missingProjects.set(item.projectId, []);
      }
      missingProjects.get(item.projectId)!.push(item);

    } else {
      // console.log("project available:", item.projectId);
    }
  }
  if (missingProjects.size === 0) {
    console.log("Projects Integrity OK. ✅");
    return;
  }
  console.log("Projects Integrity failed. ❌");
  console.log("missing project count:", missingProjects.size);
  console.log("missing projects:", missingProjects);
  const uuids = Array.from(missingProjects.keys());
  for (const u of uuids) {
    try { await async_createNewProject("UNKNOWN PROJECT", u); }
    catch (err) { console.log("err:", err); }
  }
}

export function getNewOrderingNumber(items: ItemType[], index: number, nextIndex: number, category: CategoryType): number {
  const ORDER_SHIFT = getOrderingShiftBasedOnStartWeekday();
  const len = items.length;
  if (len === 0) return ORDERING_STEP + ORDER_SHIFT;
  const top = (items[0]?.ordering?.[category] || 0) - ORDERING_STEP + ORDER_SHIFT;
  const bot = (items[len - 1]?.ordering?.[category] || 0) + ORDERING_STEP + ORDER_SHIFT;
  if (index < 0 || nextIndex < 0) {
    return top;
  }
  if (index >= len || nextIndex >= len) {
    return bot;
  }
  const x = items[index]?.ordering?.[category] || (0 + ORDER_SHIFT);
  const y = items[nextIndex]?.ordering?.[category] || (ORDERING_STEP + ORDER_SHIFT);
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

/*
  * don't like these. they also get synced everytime when loging in with new device!
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
      const currentTime = timeToISO();
      const schedule = timeToISO(currentTime, item.week);
      newitem = {
        ...newitem,
        type: item.type,
        status: item.status,
        title: item.title,
        meta: meta,
        scheduledAt: schedule,
      };
      await async_saveAsNewItem(newitem);
    } catch (err) {
      console.error(`error adding onboarding item ${item.title}:`, err);
    }
  }
}
*/
