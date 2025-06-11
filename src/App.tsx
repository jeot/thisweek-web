import { useState } from 'react'
import './App.css'
import SidebarLayout from '@/components/SidebarLayout'
import { lorem } from '@/assets/lorem'
import { WeekDatesCard } from './components/weekDatesCard';
import { ViewType } from '@/types/types';
import { SettingsPage } from './components/SettingsPage';

function App() {
  const [view, setView] = useState<ViewType>('This Week');


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
