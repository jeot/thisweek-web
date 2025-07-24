import { ItemType, PageViewType } from '@/types/types';
import { create } from 'zustand';
import { useWeekState } from './weekStore';
import { saveAppConfigToIDBPartial } from '@/lib/appConfigDb';

export type SettingPageType = 'General' | 'Calendars' | 'Keymaps' | 'Syncing' | 'About';

type AppState = {
	pageView: PageViewType;
	setPageView: (page: PageViewType) => void;
	gotoSectionRelative: (offset: number) => void;

	internalCopiedItem: ItemType | null;
	setInternalCopiedItem: (item: ItemType) => void;

	settingPage: SettingPageType;
	setSettingPage: (p: SettingPageType) => void;

	sidebarCollapsed: boolean;
	setSidebarCollapsed: (v: boolean, save?: boolean) => void;
};

export const useAppState = create<AppState>((set, get) => ({
	pageView: 'This Week',
	setPageView: (page: PageViewType) => set({ pageView: page }),
	gotoSectionRelative: (offset: number) => {
		if (get().pageView === 'This Week') {
			useWeekState.getState().gotoWeekRelative(offset);
		}
	},

	internalCopiedItem: null,
	setInternalCopiedItem: (item: ItemType) => {
		navigator.clipboard.writeText(item.title);
		set({ internalCopiedItem: item });
		console.log("smart copy done.");
	},

	settingPage: 'Calendars',
	setSettingPage: (p) => set({ settingPage: p }),

	sidebarCollapsed: true,
	setSidebarCollapsed: (v, save = true) => {
		set({ sidebarCollapsed: v });
		if (save) saveAppConfigToIDBPartial({ sidebarCollapsed: v });
	},
}));


