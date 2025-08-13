// AppInitializer.tsx
import { useEffect, useRef, useState } from 'react';
import { ensureValidAppConfig, getAppConfigFromIDB, saveAppConfigToIDBPartial } from './lib/appConfigDb';
import { useCalendarState } from "@/store/calendarStore";
import { useKeymapsState } from "@/store/keymapStore";
import { useAppState } from "@/store/appStore";
import { insertOnboardingTasks } from './lib/items';
import { initDeviceId } from './lib/db';
import { useTheme } from 'next-themes';


export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setMainCal = useCalendarState((state) => state.setMainCal);
  const setSecondCal = useCalendarState((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarState((state) => state.setSecondCalEnabled);
  const setKeymap = useKeymapsState((state) => state.setKeymap);
  const setSidebarCollapsed = useAppState((state) => state.setSidebarCollapsed);
  const { setTheme } = useTheme();

  async function loadConfig() {
    try {
      await initDeviceId();
      await ensureValidAppConfig();
      const config = await getAppConfigFromIDB();
      console.log("saved config: ", config);
      if (config) {
        setMainCal(config.mainCalendar, false);
        setSecondCal(config.secondCalendar, false);
        setSecondCalEnabled(config.secondCalendarEnabled, false);
        setKeymap(config.keymap, false);
        setSidebarCollapsed(config.sidebarCollapsed, false);
        setTheme(config.theme.mode); // from useThemeStore
        // ... repeat for other configs
        // check if it's not seeded bofore (first time user)
        if (!config.hasSeededOnboarding) {
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

