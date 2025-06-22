import { CalendarType } from "./calendarLocales";

export type ViewType = 'This Week' | 'This Year' | 'Settings';

export type WeekdayString = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type WeekdayNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayType = WeekdayString | WeekdayNumbers;

export const weekdayMap: Record<string, number> = {
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
  id: number;
  title: string;
  type: 'todo' | 'note';
  status: string;
}

export interface ItemTypeRC {
  id: number;
  uuid: string;

  title: string;
  type: 'todo' | 'note' | 'event';
  status: 'done' | 'undone' | 'pending' | 'blocked' | 'canceled';
  kind: 'weekly' | 'yearly' | 'project';
  project: string;

  calendar: string; // the calendar system of the item
  datetimeUtc: number; // the utc time of creation
  tzOffset: number; // the timezone shift of local time of creation
  tzCity: string; // the timezone city/country name
  fixedDate: boolean; // is a fixed date assigned?
  allDay: boolean; // is it all day due?
  duration: number; // the duration (only for event type)

  parrent: string | null; // ref. to uuid. is item child or not
  order: number; // order of items

  sync: string; // new, modified, deleted, synced
  syncedAtUtc: number | null;
  createdAt: number;
  updatedAt: number;
}
