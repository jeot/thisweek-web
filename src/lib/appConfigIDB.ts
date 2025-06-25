import { CalendarLocaleType, LocaleType, WeekdayType } from '@/types/types';
import { DBSchema, openDB } from 'idb';

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

const APP_CONFIG_DB = "app-config-db";
const CONFIG_STORE = "app-config-store";
const USER_APP_CONFIG_KEY = "user-app-config";

interface AppConfig {
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
}

interface AppDB extends DBSchema {
  'app-config-store': {
    key: string
    value: AppConfig;
  };
}

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

const db = openDB<AppDB>(APP_CONFIG_DB, 1, {
  upgrade(db) {
    console.log("upgrading...");
    try {
      if (!db.objectStoreNames.contains(CONFIG_STORE)) {
        db.createObjectStore(CONFIG_STORE);
      }
    } catch (err) {
      console.log("error in upgrade:", err);
    }
  },
  blocked(currentVersion, blockedVersion, event) {
    console.log("blocked!");
    console.log(currentVersion, blockedVersion, event);
    // …
  },
  blocking(currentVersion, blockedVersion, event) {
    console.log("blocking?!");
    console.log(currentVersion, blockedVersion, event);
    // …
  },
  terminated() {
    console.log("terminated!!");
    // …
  },
});

export async function getAppConfigFromIDB(): Promise<AppConfig | undefined> {
  try {
    // console.log("geting config...");
    const result = (await db).get(CONFIG_STORE, USER_APP_CONFIG_KEY);
    return result;
  } catch (err) {
    console.log("catch error: ", err);
  }
}

async function saveAppConfigToIDB(value: AppConfig) {
  try {
    console.log("saving config... ", value);
    return (await db).put(CONFIG_STORE, value, USER_APP_CONFIG_KEY);
  } catch (err) {
    console.log("catch error: ", err);
  }
}

export async function ensureValidAppConfig() {
  try {
    const existing = await getAppConfigFromIDB();
    if (!existing) {
      console.log("no config found! saving default...");
      await saveAppConfigToIDBPartial(DEFAULT_APP_CONFIG);
    }
  } catch (err) {
    console.log("catch error: ", err);
  }
}

export async function saveAppConfigToIDBPartial(partial: Partial<AppConfig>) {
  try {
    const current = await getAppConfigFromIDB();
    if (current) {
      const merged = { ...current, ...partial };
      await saveAppConfigToIDB(merged);
    } else {
      const merged = { ...DEFAULT_APP_CONFIG, ...partial };
      await saveAppConfigToIDB(merged);
    }
  } catch (err) {
    console.log("catch error: ", err);
  }
}

