// AppInitializer.tsx
import { useEffect, useRef, useState } from 'react';
import { ensureValidAppConfig, getAppConfigFromIDB, saveAppConfigToIDBPartial } from './lib/appConfigDb';
import { useCalendarState } from "@/store/calendarStore";
import { useKeymapsState } from "@/store/keymapStore";
import { useAppState } from "@/store/appStore";
import { getItemsCount, insertOnboardingTasks } from './lib/items';
import { initDeviceId } from './lib/db';
import { useThemeState } from './store/themeStore';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setMainCal = useCalendarState((state) => state.setMainCal);
  const setSecondCal = useCalendarState((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarState((state) => state.setSecondCalEnabled);
  const setKeymap = useKeymapsState((state) => state.setKeymap);
  const setSidebarCollapsed = useAppState((state) => state.setSidebarCollapsed);
  const setTheme = useThemeState((state) => state.setTheme);

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

