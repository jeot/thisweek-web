import { useEffect, useState } from 'react'
import './App.css'
import SidebarLayout from '@/components/SidebarLayout'
import { lorem } from '@/assets/lorem'
import { WeekDatesCard } from './components/weekDatesCard';
import { ViewType } from '@/types/types';
import { Settings as SettingsPage } from './components/Settings';
import { ensureValidAppConfig, getAppConfigFromIDB } from './store/appConfigIDB';
import { useCalendarState } from "@/store/calendarStore";

function App() {
  const [view, setView] = useState<ViewType>('This Week');
  const setMainCal = useCalendarState((state) => state.setMainCal);
  const setSecondCal = useCalendarState((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarState((state) => state.setSecondCalEnabled);


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
  }, []);


  const ThisWeekPage = () =>
    <div className="p-4">
      <div className="flex justify-center">
        <WeekDatesCard />
      </div>
      <p>&nbsp;</p>
      <p>{lorem}</p>
    </div>;
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
