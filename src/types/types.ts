export type ViewType = 'This Week' | 'This Year' | 'Settings';

export type CalendarType = 'gregory' | 'chinese' | 'hebrew' | 'islamic' | 'japanese' | 'indian' | 'persian' | 'iso8601' | 'buddhist' | 'roc' | 'coptic' | 'ethiopic' | 'ethiopia';

export interface LocaleType {
  locale: string;
  language: string;
  region: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

export type WeekdayType = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const weekdayMap: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

export interface CalendarLocaleType {
  calendar: CalendarType;
  locale: LocaleType;
  weekStartsOn: WeekdayType;
}

