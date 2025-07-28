import { CalendarType } from "./calendarLocales";

export type PageViewType = 'This Week' | 'This Year' | 'Projects' | 'Settings';

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

// export type ItemContextMenuType = Array<{ name: 'Edit' | 'Copy' | 'Delete', action: (iat: ItemActionType) => void }>;

export interface ItemType {
  id: number; // sql local/server id. it can be different on different servers!
  uuid: string; // the actual unique id of an item to work with!
  userId: string | null; // future: e.g., 'local', or real user UID when logged in

  title: string;
  type: 'todo' | 'note'; // initially wanted to have 'event' type, but i think it's overkill!
  status: 'done' | 'undone' | 'pending' | 'blocked' | 'canceled';
  category: 'weekly' | 'yearly' | 'project';
  projectId: number | null; // future: reference the projects table.

  calendar: string; // the calendar system of the item
  scheduledAt: number; // the utc time that is assigned to the item
  completedAt: number | null; // to keep track of when a task is finished, useful for sorting
  tzOffset: number; // the timezone shift of local time
  tzIANA: string; // the timezone city/country name (for display only)
  dueType: 'allday' | 'fixed' | null; // future: a fixed date&time is assigned to the item or not?
  duration: number; // future: the duration of the item

  parent: string | null; // future: reference to uuid. is this item a child (sub item) of another item?
  order: Record<string, number>;    // future: per-view order (weekly, project)
  // future: when and how to send notification? PostgreSQL: Store as JSONB
  notification: {
    method: 'popup' | 'email' | 'sound';
    offset: number; // e.g., 900 = 15 mins before
  } | null;
  pinned: boolean; // future
  tags: string[]; // future
  meta: Record<string, any> | null; // future: for rare/experimental fields, e.g., colors
  recurrence: null; // future

  // future: syncing & encryption
  createdAt: number;
  modifiedAt: number;
  deletedAt: number | null; // future: for deleting items with syncing
  version: number; // future: for syncing, conflict resolution, versioning, colaboration.
  syncedAt: number | null; // only for debugging
  modifiedBy: string // device ID
  iv: string | null; // iv for encryption
  encrypted: boolean;
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

export interface EncryptionKeyEntry {
  id: string;         // e.g., "local_dek"
  encryptedKey: string; // base64 string
  iv: string;           // base64 string
}

