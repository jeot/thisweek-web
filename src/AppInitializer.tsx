// AppInitializer.tsx
import { useEffect, useRef, useState } from 'react';
import { async_ensureValidAppConfig, async_getAppConfigFromIDB, async_saveAppConfigToIDBPartial } from './lib/appConfigDb';
import { useCalendarConfig } from "@/store/calendarConfig";
import { useKeymapsConfig } from "@/store/keymapConfig";
import { async_checkDraftIntegrity, async_checkUuidIntegrity, async_getDraftItem, async_getItemsCount, async_insertOnboardingTasks } from './lib/items';
import { async_initDeviceId } from './lib/db';
import { useThemeConfig } from '@/store/themeConfig';
import { useOtherConfigs } from '@/store/otherConfigs';
import { useAppLogic } from './store/appLogic';
import { useIsMobile } from './lib/useIsMobile';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setMainCal = useCalendarConfig((state) => state.setMainCal);
  const setSecondCal = useCalendarConfig((state) => state.setSecondCal);
  const setSecondCalEnabled = useCalendarConfig((state) => state.setSecondCalEnabled);
  const setKeymap = useKeymapsConfig((state) => state.setKeymap);
  const setTheme = useThemeConfig((state) => state.setTheme);
  const setSidebarCollapsed = useOtherConfigs((state) => state.setSidebarCollapsed);
  const requestGoToToday = useAppLogic((state) => state.requestGoToToday);
  const setEditingExistingItemsForced = useAppLogic((state) => state.setEditingExistingItemsForced);
  const setEditingNewItemsForced = useAppLogic((state) => state.setEditingNewItemsForced);
  const setIsMobile = useAppLogic((state) => state.setIsMobile);

  const isMobile = useIsMobile();
  useEffect(() => {
    // console.log("setting isMobile:", isMobile);
    setIsMobile(isMobile);
    return () => { }
  }, [isMobile]);

  async function loadConfig() {
    try {
      console.log("loading config from disk...");
      await async_initDeviceId();
      await async_ensureValidAppConfig();
      await async_checkDraftIntegrity();
      await async_checkUuidIntegrity();
      const config = await async_getAppConfigFromIDB();
      const hasItems = (await async_getItemsCount()) > 0;
      console.log("saved config: ", config);
      if (config) {
        setMainCal(config.mainCalendar, false);
        setSecondCal(config.secondCalendar, false);
        setSecondCalEnabled(config.secondCalendarEnabled, false);
        setKeymap(config.keymap, false);
        setSidebarCollapsed(config.sidebarCollapsed, false);
        setTheme(config.theme, false);
        // ... do for other configs
        // check if it's not seeded bofore (first time user)
        if (!config.hasSeededOnboarding && !hasItems) {
          await async_insertOnboardingTasks();
          await async_saveAppConfigToIDBPartial({ hasSeededOnboarding: true });
        }
        // only load the drafts once in startup
        const existingDraft = await async_getDraftItem('editing_existing');
        const newDraft = await async_getDraftItem('editing_new');
        if (existingDraft) {
          setEditingExistingItemsForced(existingDraft);
        }
        if (newDraft) {
          setEditingNewItemsForced(newDraft);
        }
        requestGoToToday();
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

