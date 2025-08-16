import { useEffect } from 'react'
import '@/App.css'
import { SidebarLayout } from '@/components/SidebarLayout'
import { ThisWeekPage } from '@/components/ThisWeekPage';
import { SettingsPage } from '@/components/SettingsPage';
import { lorem } from '@/assets/lorem'
import { useCalendarConfig } from "@/store/calendarConfig";
import { useAppLogic } from "@/store/appLogic";
import * as keymaps from '@/lib/keymaps';
import { useKeymapsConfig } from "@/store/keymapConfig";
import { useThemeConfig } from "@/store/themeConfig";
import { useActionListener } from './lib/useActionListener';
import { useTheme } from 'next-themes';
import { useLocalDbSyncItems } from './lib/dexieListeners';

const loadedCSS = new Set<string>();

function loadRemoteCSS(href: string) {
  if (loadedCSS.has(href)) return;
  const existing = document.querySelector(`link[href="${href}"]`);
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  loadedCSS.add(href);
}

/*
const loadedFonts = new Set<string>();

function preloadFont(href: string, type = 'font/woff2') {
  if (loadedFonts.has(href)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = href;
  link.type = type;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
  loadedFonts.add(href);
}
*/

function App() {
  const pageView = useAppLogic((state) => state.pageView);
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const secondCalendar = useCalendarConfig((state) => state.secondCal);
  const toggleTheme = useThemeConfig((state) => state.toggleTheme);
  const { setTheme } = useTheme();

  useLocalDbSyncItems();

  const theme = useThemeConfig((state) => state.theme);
  useEffect(() => {
    console.log("setting theme to", theme.mode);
    setTheme(theme.mode);
    return;
  }, [theme]);

  const keymap = useKeymapsConfig((state) => state.keymap);
  useEffect(() => {
    if (keymap.generalShortcutsEnabled) keymaps.init("GENERAL");
    if (keymap.vimModeShortcutsEnabled) keymaps.init("VIMMODE");
    return () => {
      keymaps.deinit();
    }
  }, [keymap]);

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

  useActionListener('toggle_theme', () => toggleTheme());

  const ThisYearPage = () => <div className='p-4'><h1>ThisYearPage</h1><p>Maybe in the future!</p><p>{lorem}</p></div>;
  const ProjectsPage = () => <div className='p-4'><h1>Projects/ListPage</h1><p>Maybe in the future!</p><p>{lorem}</p></div>;


  return (
    <div className="font-global">
      <SidebarLayout
        activeView={pageView}
        title={pageView}
      >
        {pageView === 'This Week' && <ThisWeekPage />}
        {pageView === 'This Year' && <ThisYearPage />}
        {pageView === 'Projects' && <ProjectsPage />}
        {pageView === 'Settings' && <SettingsPage />}
        {/* and so on */}
      </SidebarLayout>
    </div>
  )
}

export default App
