import { useEffect } from 'react'
import '@/App.css'
import { SidebarLayout } from '@/components/SidebarLayout'
import { ThisWeekPage } from '@/components/ThisWeekPage';
import { Settings as SettingsPage } from '@/components/Settings';
import { lorem } from '@/assets/lorem'
import { ensureValidAppConfig, getAppConfigFromIDB } from '@/lib/appConfigIDB';
import { useCalendarState } from "@/store/calendarStore";
import { useAppState } from "@/store/appStore";
import * as keymap from '@/lib/keymaps';
import { useTheme } from 'next-themes';
import { PageViewType } from './types/types';

function loadRemoteCSS(href: string) {
  const existing = document.querySelector(`link[href="${href}"]`);
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

function preloadFont(href: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = href;
  link.type = 'font/woff';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

function App() {
  const pageView = useAppState((state) => state.pageView);
  const setPageView = useAppState((state) => state.setPageView);
  const mainCal = useCalendarState((state) => state.mainCal);
  const secondCalendar = useCalendarState((state) => state.secondCal);
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

  /*Suggested Font Mapping
  Locale	Font Suggestion
  en	Inter, Roboto, etc.
  fa	Shabnam, Vazirmatn
  ar	Cairo, Amiri
  he	Rubik, Assistant
  hi	Noto Sans Devanagari
  zh	Noto Sans SC (Simplified)
  ja	Noto Sans JP
  ko	Noto Sans KR
  ru	Noto Sans, PT Sans
  et	Abyssinica SIL
  */
  useEffect(() => {
    // console.log(mainCal.locale.locale.slice(0, 2), secondCalendar.locale.locale.slice(0, 2));
    console.log('loading Open Sans font.');
    loadRemoteCSS('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');

    if (mainCal.locale.locale.slice(0, 2) === 'en' || secondCalendar.locale.locale.slice(0, 2) === 'en') {
      // console.log('loading english font');
      // loadRemoteCSS('./src/fonts/roboto.css');
      // document.documentElement.classList.add('font-roboto');
    }
    if (mainCal.locale.locale.slice(0, 2) === 'fa' || secondCalendar.locale.locale.slice(0, 2) === 'fa') {
      console.log('loading farsi font');
      preloadFont('/fonts/Shabnam.woff');
      loadRemoteCSS('/fonts/shabnam.css');
      // document.documentElement.classList.add('font-global');
    }
    if (mainCal.locale.locale.slice(0, 2) === 'zh' || secondCalendar.locale.locale.slice(0, 2) === 'zh') {
      console.log('loading chinese font');
      loadRemoteCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap');
      // document.documentElement.classList.add('font-global');
    }
    if (mainCal.locale.locale.slice(0, 2) === 'ja' || secondCalendar.locale.locale.slice(0, 2) === 'ja') {
      console.log('loading japanese font');
      loadRemoteCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap');
      // document.documentElement.classList.add('font-global');
    }
    if (mainCal.locale.locale.slice(0, 2) === 'ko' || secondCalendar.locale.locale.slice(0, 2) === 'ko') {
      console.log('loading korean font');
      loadRemoteCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap');
      // document.documentElement.classList.add('font-global');
    }
    /* hebrew is already included in Open Sans
     if (mainCal.locale.locale.slice(0, 2) === 'he' || secondCalendar.locale.locale.slice(0, 2) === 'he') {
      console.log('loading hebrew font');
      loadRemoteCSS("https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew&display=swap");
      // document.documentElement.classList.add('font-global');
    }
    */
    // document.documentElement.classList.add('font-global');
  }, [mainCal, secondCalendar]);



  function handleKeymapCallback(action: string): void {
    if (action === 'toggle_theme') setTheme(theme === 'light' ? 'dark' : 'light');
  }

  useEffect(() => {
    const unliten = keymap.listenToActions(handleKeymapCallback);
    return () => {
      unliten();
    }
  }, [theme]);

  const ThisYearPage = () => <div><h1>ThisYearPage</h1><p>{lorem}</p></div>;
  const handleChangePageView = (page: PageViewType) => {
    setPageView(page);
  };


  return (
    <div className="font-global">
      <SidebarLayout
        onMenuClick={handleChangePageView}
        activeView={pageView}
        title={pageView}
      >
        {pageView === 'This Week' && <ThisWeekPage />}
        {pageView === 'This Year' && <ThisYearPage />}
        {pageView === 'Settings' && <SettingsPage />}
        {/* and so on */}
      </SidebarLayout>
    </div>
  )
}

export default App
