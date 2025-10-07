import { useEffect } from 'react'
import '@/App.css'
import { SidebarLayout } from '@/components/SidebarLayout'
import { ThisWeekPage } from '@/components/ThisWeekPage';
import { SettingsPage } from '@/components/SettingsPage';
import { lorem } from '@/assets/lorem'
import { useCalendarConfig } from "@/store/calendarConfig";
import { LoginInfoModalType, useAppLogic } from "@/store/appLogic";
import * as keymaps from '@/lib/keymaps';
import { useKeymapsConfig } from "@/store/keymapConfig";
import { useThemeConfig } from "@/store/themeConfig";
import { useAppLogicForAllActionListeners } from './lib/useActionListener';
import { useTheme } from 'next-themes';
import { useLocalDbSyncItems } from './lib/dexieListeners';
import { useLocation } from 'react-router-dom';
import { supabase_client } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { async_newUserInfoUuid, getUserInfoUuid } from './lib/db';
import { useDataSyncStore } from './store/dataSyncStore';
// import { Button } from './components/ui/button';
// import DevDbTools from './components/DevDbTools';

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

// mini hook for running sync each minute in the background
function useSyncLoop() {
  const session = useAuthStore((s) => s.session);
  const startSync = useDataSyncStore((s) => s.startSync);
  useEffect(() => {
    // no active session? stop syncing
    if (!session) return;
    // run once immediately
    startSync();
    // start periodic sync
    const id = setInterval(startSync, 60_000);
    console.log("Started background sync loop");
    // cleanup on sign-out or unmount
    return () => {
      clearInterval(id);
      console.log("Stopped background sync loop");
    };
  }, [session, startSync]);
}

function App() {
  const location = useLocation();
  const setShowLoginInfoModal = useAppLogic((state) => state.setShowLoginInfoModal);
  const pageView = useAppLogic((state) => state.pageView);
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const secondCalendar = useCalendarConfig((state) => state.secondCal);
  const { setTheme } = useTheme();

  const fetchClaims = useAuthStore((state) => state.fetchClaims);
  const session = useAuthStore((state) => state.session);

  useSyncLoop();

  // Authentication
  useEffect(() => {
    fetchClaims();
    const { data: listener } = supabase_client.auth.onAuthStateChange((_event, _session) => {
      fetchClaims();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // On session change
  useEffect(() => {
    const lastUserId = getUserInfoUuid();
    const loggedInUserId = session?.user.id || null;
    if (loggedInUserId !== null && lastUserId === null) {
      console.log("new user info id:", loggedInUserId)
      async_newUserInfoUuid(loggedInUserId).then(() => console.log("done")).catch((e) => console.log("error: ", e));
    } else if (loggedInUserId !== null && lastUserId !== null && loggedInUserId !== lastUserId) {
      console.log("!!!! TODO !!!! new user info id changed! ", lastUserId, " -> ", loggedInUserId)
      console.log("should clear old user stuff first!")
      async_newUserInfoUuid(loggedInUserId).then(() => console.log("done")).catch((e) => console.log("error: ", e));
    } else if (loggedInUserId !== null && lastUserId !== null && loggedInUserId === lastUserId) {
      console.log("welcome same old user!");
      // syncNow();
    } else {
      console.log("no session.");
    }

    return () => { };
  }, [session]);

  // Open login modal if navigation passed "openLogin"
  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLoginInfoModal(location.state?.openLogin as LoginInfoModalType);
    } else {
      setShowLoginInfoModal(null);
    }
  }, [location.state]);

  useLocalDbSyncItems();

  useAppLogicForAllActionListeners();

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

  const ThisYearPage = () => <div className='p-4'><h1>ThisYearPage</h1><p>Maybe in the future!</p><p>{lorem}</p></div>;
  const ProjectsPage = () => <div className='p-4'><h1>Projects/ListPage</h1><p>Maybe in the future!</p><p>{lorem}</p></div>;


  return (
    <div className="font-global">
      <div className="flex gap-2">
        {/*<DevDbTools />*/}
      </div>
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
    </div >
  )
}

export default App
