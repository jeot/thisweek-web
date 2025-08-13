import { getCalendarLocaleWeekStartDay } from '@/types/calendarLocales';
import { CalendarLocaleType, WeekdayType } from '@/types/types';
import { DBSchema, openDB } from 'idb';

export const DEFAULT_MAIN_CAL_LOC: CalendarLocaleType = getCalendarLocaleWeekStartDay('gregory')!;
export const DEFAULT_SECOND_CAL_LOC: CalendarLocaleType = getCalendarLocaleWeekStartDay('chinese')!;

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
    generalShortcutsEnabled: boolean;
    vimModeShortcutsEnabled: boolean;
    mappings?: Record<string, string>;
  };
  holidays: {
    weekend: boolean,
    customDays: WeekdayType[];
    autoFetchEnabled: boolean;
  };
  sidebarCollapsed: boolean;
  hasSeededOnboarding: boolean;
}

interface AppDB extends DBSchema {
  'app-config-store': {
    key: string
    value: AppConfig;
  };
}

const DEFAULT_APP_CONFIG: AppConfig = {
  theme: {
    mode: 'dark',
    custom: undefined
  },
  mainCalendar: DEFAULT_MAIN_CAL_LOC,
  secondCalendar: DEFAULT_SECOND_CAL_LOC,
  secondCalendarEnabled: false,
  keymap: {
    generalShortcutsEnabled: true,
    vimModeShortcutsEnabled: false,
    mappings: undefined
  },
  holidays: {
    weekend: false,
    customDays: [],
    autoFetchEnabled: false
  },
  sidebarCollapsed: true,
  hasSeededOnboarding: false,
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
    const result = await (await db).get(CONFIG_STORE, USER_APP_CONFIG_KEY);
    console.log("result:", result);
    // there might be new default keys added later in the development. fill them in saved config.
    return { ...DEFAULT_APP_CONFIG, ...result };
  } catch (err) {
    console.log("catch error: ", err);
    return undefined;
  }
}

async function saveAppConfigToIDB(value: AppConfig) {
  try {
    console.log("saving config... ", value);
    await (await db).put(CONFIG_STORE, value, USER_APP_CONFIG_KEY);
  } catch (err) {
    console.log("catch error: ", err);
  }
}

export async function ensureValidAppConfig() {
  try {
    const existing = await getAppConfigFromIDB();
    if (!existing) {
      console.log("no config found! saving default...");
      await saveAppConfigToIDB(DEFAULT_APP_CONFIG);
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
