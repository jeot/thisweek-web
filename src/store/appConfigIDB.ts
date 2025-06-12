import { CalendarLocaleType, LocaleType, WeekdayType } from '@/types/types';
import { openDB } from 'idb';

const enUSLocale: LocaleType = {
  locale: "en-US",
  language: "English",
  region: "United States",
  nativeName: "English",
  flag: "🇺🇸",
  direction: "ltr"
};


import localesData from '@/types/locales.json'
import { calendars } from '@/types/calendarLocales'
const test_cal = 'hebrew';
const test_default_loc = calendars.find((cal) => cal.name === test_cal)!;
const test_loc_str = test_default_loc.locales[0].locale;
const test_week_start = test_default_loc.locales[0].startWeekday;
const test_locale: LocaleType = localesData.find((loc) => loc.locale === test_loc_str)! as LocaleType;

const testCal: CalendarLocaleType = {
  calendar: test_cal, locale: test_locale, weekStartsOn: test_week_start
}

export const DEFAULT_MAIN_CAL_LOC: CalendarLocaleType = {
  calendar: 'gregory', locale: enUSLocale, weekStartsOn: 'mon'
}

export const DEFAULT_SECOND_CAL_LOC: CalendarLocaleType = testCal;

type AppConfig = {
  theme: {
    mode: 'light' | 'dark';
    custom?: {
      font?: string;
      size?: string;
      colorScheme?: string;
    };
  };
  mainCalendar: CalendarLocaleType;
  secondCalendar: CalendarLocaleType;
  secondCalendarEnabled: boolean;
  keymap: {
    enabled: boolean;
    mappings?: Record<string, string>;
  };
  holidays: {
    weekend: boolean,
    customDays: WeekdayType[];
    autoFetchEnabled: boolean;
  };
};

const DEFAULT_APP_CONFIG: AppConfig = {
  theme: {
    mode: 'light',
    custom: undefined
  },
  mainCalendar: DEFAULT_MAIN_CAL_LOC,
  secondCalendar: DEFAULT_SECOND_CAL_LOC,
  secondCalendarEnabled: false,
  keymap: {
    enabled: false,
    mappings: undefined
  },
  holidays: {
    weekend: false,
    customDays: [],
    autoFetchEnabled: false
  }
};

const APP_CONFIG_DB = 'app-config-db';
const APP_CONFIG_STORE = 'app-config-store';
const USER_APP_CONFIG_KEY = 'user-app-config';

const db = openDB(APP_CONFIG_DB, 1, {
  upgrade(db) {
    db.createObjectStore(APP_CONFIG_STORE);
  },
});

export async function getAppConfigFromIDB(): Promise<AppConfig | null> {
  return (await db).get(APP_CONFIG_STORE, USER_APP_CONFIG_KEY);
}

async function saveAppConfigToIDB(value: AppConfig) {
  return (await db).put(APP_CONFIG_STORE, value, USER_APP_CONFIG_KEY);
}

export async function ensureValidAppConfig() {
  const existing = await getAppConfigFromIDB();
  if (!existing) {
    await saveAppConfigToIDBPartial(DEFAULT_APP_CONFIG);
  }
}

export async function saveAppConfigToIDBPartial(partial: Partial<AppConfig>) {
  const current = await getAppConfigFromIDB();
  if (current) {
    const merged = { ...current, ...partial };
    await saveAppConfigToIDB(merged);
  } else {
    const merged = { ...DEFAULT_APP_CONFIG, ...partial };
    await saveAppConfigToIDB(merged);
  }
}

