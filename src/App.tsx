import { useState } from 'react'
import './App.css'
import SidebarLayout from '@/components/SidebarLayout'
import { lorem } from '@/assets/lorem'

function App() {
  const [view, setView] = useState<'thisweek' | 'thisyear' | 'settings'>('thisweek');


  const ThisWeekPage = () => <div><h1>ThisWeekPage</h1><p>{lorem}</p></div>;
  const ThisYearPage = () => <div><h1>ThisYearPage</h1><p>{lorem}</p></div>;
  const SettingsPage = () => <div><h1>SettingsPage</h1><p>{lorem}</p></div>;

  const handleMenuClick = (key: typeof view) => {
    setView(key);
    // fetch or load data based on key
  };

  return (
    <>
      <SidebarLayout
        onMenuClick={handleMenuClick}
        activeView={view}
      >
        {view === 'thisweek' && <ThisWeekPage />}
        {view === 'thisyear' && <ThisYearPage />}
        {view === 'settings' && <SettingsPage />}
        {/* and so on */}
      </SidebarLayout>
    </>
  )
}

export default App
