import { Json } from "@/lib/supabase/database.types";
import { CalendarType } from "./calendarLocales";


export type PageViewType = 'This Week' | 'This Year' | 'Projects' | 'Settings';

// export type Action = 'today' | 'up' | 'down' | 'left' | 'right' | 'move_up' | 'move_down' | 'move_left' | 'move_right' | 'delete' | 'edit_start' | 'edit_end' | 'edit_select_all' | 'copy' | 'paste' | 'copy_all_items_text' | 'toggle_theme' | 'toggle_status' | 'toggle_type' | 'paste_above' | 'cancel' | 'create' | 'create_above' | 'todo';
export const actions = [
  'TODAY',
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'MOVE_UP',
  'MOVE_DOWN',
  'MOVE_LEFT',
  'MOVE_RIGHT',
  'DELETE',
  'EDIT_START',
  'EDIT_END',
  'EDIT_SELECT_ALL',
  'COPY',
  'PASTE',
  'COPY_ALL_ITEMS_TEXT',
  'TOGGLE_THEME',
  'TOGGLE_STATUS',
  'TOGGLE_TYPE',
  'RUN_SYNC_ONCE',
  'PASTE_ABOVE',
  'CANCEL',
  'CREATE',
  'CREATE_ABOVE',
  'TODO',
] as const;

export type Action = typeof actions[number];

export type WeekdayString = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type WeekdayNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayType = WeekdayString | WeekdayNumbers;

export const weekdayMap: Record<string, WeekdayNumbers> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

export interface LocaleType {
  locale: string;
  language: string;
  region: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

export interface CalendarLocaleType {
  calendar: CalendarType; // string
  locale: LocaleType;
  weekStartsOn: WeekdayType;
}

// Narrow only the fields you care about
export type OrderType = Partial<Record<CategoryType | 'pinned', number>> | null;
export type CategoryType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'project' | 'personal' | 'work' | 'goal' | 'life';
export type StatusType = 'undone' | 'done' | 'pending' | 'blocked' | 'canceled' | 'delegated' | 'snoozed' | 'inprogress';

export interface ItemType {
  id: number; // sql local/server id. it can be different on different servers!
  uuid: string; // the actual unique id of an item to work with!
  userId: string | null; // null if local, or real user UID when logged in

  title: string;
  type: 'todo' | 'note' | 'event' | 'habit' | 'journal' | 'reminder'; // most of them is overkill but we included here for database safty!
  status: StatusType;
  category: CategoryType;
  projectId: string | null; // future: reference the projects table.

  calendar: string; // the calendar system of the item
  scheduledAt: string; // the iso utc time that is assigned to the item
  completedAt: string | null; // to keep track of when a task is finished, useful for sorting
  tzOffset: number; // the timezone shift of local time
  tzIANA: string; // the timezone city/country name (for display only)
  dueType: 'allday' | 'fixed' | 'range' | 'floating' | null; // future: a fixed date&time is assigned to the item or not?
  duration: number; // future: the duration of the item

  parent: string | null; // future: reference to uuid. is this item a child (sub item) of another item?
  ordering: OrderType;    // future: per-view order (weekly, project, pinned)
  // future: when and how to send notification? PostgreSQL: Store as JSONB
  notification: Json | null; // future
  pinned: boolean; // future
  meta: Json | null; // future: for rare/experimental fields, e.g., colors
  recurrence: Json | null; // future

  // future: encryption
  iv: string | null; // iv for encryption
  isEncrypted: boolean; // for encryption
  ciphertext: string | null; // for encryption
  keyVersion: number; // for encryption

  // future: syncing
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null; // future: for deleting items with syncing
  version: number; // future: for syncing, conflict resolution, versioning, colaboration.
  syncedAt: string | null; // only for debugging
  modifiedBy: string // device ID
}

// future: projects table
/*
interface ProjectType {
  id: number;        // primary key
  uuid: string;      // optional: for syncing if needed
  title: string;
  color: string;     // optional, for UI
  icon: string;      // optional
  createdAt: number;
  modifiedAt: number;
}
*/

export interface DeviceInfo {
  key: string;     // always "deviceId" (you could use enum too)
  value: string;   // the UUID
}

// temporary values to fill when user login first time
export interface UserInfo {
  key: string;     // user_flag, uuid, email, ...
  value: string;   // the UUID of the logged-in user
}

// to hold sync parameters (for incremental sync)
export interface SyncInfo {
  key: 'syncinfo';
  lastRemoteSyncIsoTime: string;
}


export interface EncryptionKeyEntry {
  id: string;         // e.g., "local_dek"
  encryptedKey: string; // base64 string
  iv: string;           // base64 string
}

