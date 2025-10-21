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
import { async_getUserInfo, async_updatePartialUserInfo } from './lib/db';
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

// mini hook for managing user login and running sync each minute in the background
function useSyncLoop() {
  const session = useAuthStore((s) => s.session);
  const startSync = useDataSyncStore((s) => s.startSync);
  useEffect(() => {
    if (!session) return;
    let intervalId: NodeJS.Timeout | null = null;
    let shouldContinue = false;

    const async_doYourMagic = async () => {
      try {
        const userInfo = await async_getUserInfo();
        const lastUserId = userInfo.uuid;
        // check if it is new user or not
        const loggedInUserId = session?.user.id || null;
        if (loggedInUserId !== null && lastUserId === null) {
          console.log("new user info id:", loggedInUserId)
          await async_updatePartialUserInfo({ uuid: loggedInUserId });
          // continue to sync...
          shouldContinue = true;
          startSync(); // normal funtion (not async)!
        } else if (loggedInUserId !== null && lastUserId !== null && loggedInUserId !== lastUserId) {
          console.log("!!!! TODO !!!! new user! uuid changed! ", lastUserId, " -> ", loggedInUserId)
          console.log("should clear old user stuff first!")
          // await async_updatePartialUserInfo({ uuid: loggedInUserId });
          shouldContinue = false;
          return; // todo: don't sync for now. this section will be implemented in the future!
        } else if (loggedInUserId !== null && lastUserId !== null && loggedInUserId === lastUserId) {
          console.log("welcome same old user!");
          // continue to sync...
          shouldContinue = true;
          startSync(); // normal funtion (not async)!
        } else {
          shouldContinue = false;
          return; // don't sync. also no timer!
        }

        // only start periodic sync if syncing is active
        if (shouldContinue) {
          intervalId = setInterval(startSync, 60_000);
          console.log("Started background sync loop");
        }
      } catch (err) {
        console.error("Error in sync loop:", err);
      }
    };

    async_doYourMagic(); // async function!

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Stopped background sync loop");
      }
    };
  }, [session, startSync]);
}

function App() {
  const location = useLocation();
  const { setTheme } = useTheme();

  const setShowLoginInfoModal = useAppLogic((state) => state.setShowLoginInfoModal);
  const pageView = useAppLogic((state) => state.pageView);
  const unsyncedItemsCount = useAppLogic((state) => state.unsyncedItemsCount);
  const toggleDebugInfo = useAppLogic((s) => s.toggleDebugInfo);

  const mainCal = useCalendarConfig((state) => state.mainCal);
  const secondCalendar = useCalendarConfig((state) => state.secondCal);

  const fetchClaims = useAuthStore((state) => state.fetchClaims);

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
      {toggleDebugInfo && <div className="absolute bottom-1 right-1 px-1 text-xs border border-border">
        Unsynced: {unsyncedItemsCount > 0 && <span className="text-orange-600">{unsyncedItemsCount}</span> || "0"}
      </div>}
    </div >
  )
}

export default App
