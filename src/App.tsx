import { useEffect, useState } from 'react'
import './App.css'
import { SidebarLayout } from '@/components/SidebarLayout'
import { ThisWeekPage } from '@/components/ThisWeekPage';
import { Settings as SettingsPage } from '@/components/Settings';
import { lorem } from '@/assets/lorem'
import { ViewType } from '@/types/types';
import { ensureValidAppConfig, getAppConfigFromIDB } from '@/lib/appConfigIDB';
import { useCalendarState } from "@/store/calendarStore";
import * as keymap from '@/lib/keymaps';
import { useTheme } from 'next-themes';

function App() {
  const [view, setView] = useState<ViewType>('This Week');
  const setMainCal = useCalendarState((state) => state.setMainCal);
  const setSecondCal = useCalendarState((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarState((state) => state.setSecondCalEnabled);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        await ensureValidAppConfig();
        const saved = await getAppConfigFromIDB();
        console.log("saved config: ", saved);
        if (saved) {
          setMainCal(saved.mainCalendar, false);
          setSecondCal(saved.secondCalendar, false);
          setSecondCalEnabled(saved.secondCalendarEnabled, false);
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
    })();

    keymap.init();
    return () => {
      keymap.deinit();
    }
  }, []);

  function handleKeymapCallback(action: string): void {
    if (action === 'toggle_theme') setTheme(theme === 'light' ? 'dark' : 'light');
  }

  useEffect(() => {
    const unliten = keymap.listen(handleKeymapCallback);
    return () => {
      unliten();
    }
  }, [theme]);

  const ThisYearPage = () => <div><h1>ThisYearPage</h1><p>{lorem}</p></div>;
  const handleMenuClick = (key: typeof view) => {
    setView(key);
    // fetch or load data based on key
  };


  return (
    <>
      <SidebarLayout
        onMenuClick={handleMenuClick}
        activeView={view}
        title={view}
      >
        {view === 'This Week' && <ThisWeekPage />}
        {view === 'This Year' && <ThisYearPage />}
        {view === 'Settings' && <SettingsPage />}
        {/* and so on */}
      </SidebarLayout>
    </>
  )
}

export default App
