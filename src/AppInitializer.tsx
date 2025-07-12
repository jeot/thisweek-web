// AppInitializer.tsx
import { useEffect, useState } from 'react';
import { ensureValidAppConfig, getAppConfigFromIDB } from './lib/appConfigDb';
import { useCalendarState } from "@/store/calendarStore";
import { useKeymapsState } from "@/store/keymapStore";
import { useAppState } from "@/store/appStore";


export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setMainCal = useCalendarState((state) => state.setMainCal);
  const setSecondCal = useCalendarState((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarState((state) => state.setSecondCalEnabled);
  const setKeymap = useKeymapsState((state) => state.setKeymap);
  const setSidebarCollapsed = useAppState((state) => state.setSidebarCollapsed);


  async function loadConfig() {
    try {
      await ensureValidAppConfig();
      const saved = await getAppConfigFromIDB();
      console.log("saved config: ", saved);
      if (saved) {
        setMainCal(saved.mainCalendar, false);
        setSecondCal(saved.secondCalendar, false);
        setSecondCalEnabled(saved.secondCalendarEnabled, false);
        setKeymap(saved.keymap, false);
        setSidebarCollapsed(saved.sidebarCollapsed, false);
        // if (saved?.theme) {
        //   setTheme(saved.theme); // from useThemeStore
        // }
        // ... repeat for other configs
      } else {
        console.log("no config found!");
      }
    } catch (err) {
      console.log("app startup error:", err);
    }
  }

  useEffect(() => {
    loadConfig().then(() => setReady(true));
    return () => { }
  }, []);

  if (!ready) return null; // or a loading screen
  else return (<>{children}</>);
}

