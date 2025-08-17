// AppInitializer.tsx
import { useEffect, useRef, useState } from 'react';
import { ensureValidAppConfig, getAppConfigFromIDB, saveAppConfigToIDBPartial } from './lib/appConfigDb';
import { useCalendarConfig } from "@/store/calendarConfig";
import { useKeymapsConfig } from "@/store/keymapConfig";
import { getItemsCount, insertOnboardingTasks } from './lib/items';
import { initDeviceId } from './lib/db';
import { useThemeConfig } from '@/store/themeConfig';
import { useOtherConfigs } from '@/store/otherConfigs';
import { useAppLogic } from './store/appLogic';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setMainCal = useCalendarConfig((state) => state.setMainCal);
  const setSecondCal = useCalendarConfig((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarConfig((state) => state.setSecondCalEnabled);
  const setKeymap = useKeymapsConfig((state) => state.setKeymap);
  const setTheme = useThemeConfig((state) => state.setTheme);
  const setSidebarCollapsed = useOtherConfigs((state) => state.setSidebarCollapsed);
  const requestGoToToday = useAppLogic((state) => state.requestGoToToday);

  async function loadConfig() {
    try {
      console.log("loading config from disk...");
      await initDeviceId();
      await ensureValidAppConfig();
      const config = await getAppConfigFromIDB();
      const hasItems = (await getItemsCount()) > 0;
      console.log("saved config: ", config);
      if (config) {
        setMainCal(config.mainCalendar, false);
        setSecondCal(config.secondCalendar, false);
        setSecondCalEnabled(config.secondCalendarEnabled, false);
        setKeymap(config.keymap, false);
        setSidebarCollapsed(config.sidebarCollapsed, false);
        setTheme(config.theme, false);
        // ... repeat for other configs
        // check if it's not seeded bofore (first time user)
        if (!config.hasSeededOnboarding && !hasItems) {
          await insertOnboardingTasks();
          await saveAppConfigToIDBPartial({ hasSeededOnboarding: true });
        }
        requestGoToToday();
      } else {
        console.log("no config found!");
      }
    } catch (err) {
      console.log("app startup error:", err);
    }
  }

  const hasInitialized = useRef(false);

  useEffect(() => {
    // prevent react from running this twice!!
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    loadConfig().then(() => setReady(true));
    return () => { }
  }, []);

  if (!ready) return null; // or a loading screen
  else return (<>{children}</>);
}

