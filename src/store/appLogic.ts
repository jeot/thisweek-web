import { ItemType, PageViewType } from '@/types/types';
import { create } from 'zustand';
import { MILLISECONDS_IN_WEEK } from '@/lib/week';

export type SettingPageType = 'General' | 'Calendars' | 'Keymaps' | 'About';

type AppLogic = {
	// ui
	pageView: PageViewType;
	settingPage: SettingPageType;
	weekReference: number;
	internalCopiedItem: ItemType | null;
	selectedId: number | null;

	requestPageViewChange: (page: PageViewType) => void;

	gotoSectionRelative: (offset: number) => void;
	setInternalCopiedItem: (item: ItemType) => void;
	setSettingPage: (p: SettingPageType) => void;
	setSelectedId: (id: number | null) => void;

	setWeekReference: (wr: number) => void;
	resetWeekReference: () => void;
	gotoWeekRelative: (offset: number) => void;

};

export const useAppLogic = create<AppLogic>((set, get) => ({
	pageView: 'This Week',
	settingPage: 'Calendars',
	weekReference: (new Date()).getTime(),
	internalCopiedItem: null,
	selectedId: null,

	requestPageViewChange: (page: PageViewType) => set({ pageView: page }),

	gotoSectionRelative: (offset: number) => {
		if (get().pageView === 'This Week') {
			get().gotoWeekRelative(offset);
		}
	},
	setInternalCopiedItem: (item: ItemType) => {
		navigator.clipboard.writeText(item.title);
		set({ internalCopiedItem: item });
		console.log("smart copy done.");
	},
	setSettingPage: (p) => set({ settingPage: p }),
	setSelectedId: (id) => set({ selectedId: id }),
	setWeekReference: (wr) => set({ weekReference: wr }),
	resetWeekReference: () => set({ weekReference: (new Date()).getTime() }),
	gotoWeekRelative: (offset) => set({ weekReference: get().weekReference + (offset * MILLISECONDS_IN_WEEK) }),
}));


