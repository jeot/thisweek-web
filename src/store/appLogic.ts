import { ItemType, PageViewType } from '@/types/types';
import { create } from 'zustand';
import { MILLISECONDS_IN_WEEK } from '@/lib/week';
import { createExistingEditingItem, createNewEditingItem, getNewOrderingNumber, updateItem } from '@/lib/items';

export type SettingPageType = 'General' | 'Calendars' | 'Keymaps' | 'About';

type AppLogic = {
	// ui
	pageView: PageViewType;
	settingPage: SettingPageType;
	weekReference: number;
	internalCopiedItem: ItemType | null;
	selectedId: number | null;

	// data
	weeklyItems: ItemType[];
	projectItems: ItemType[];
	editingNewItem: ItemType | null;
	editingExistingItem: ItemType | null;
	setWeeklyItems: (items: ItemType[]) => void;
	setProjectItems: (items: ItemType[]) => void;
	setEditingNewItems: (item: ItemType | null) => void;
	setEditingExistingItems: (item: ItemType | null) => void;

	requestPageViewChange: (page: PageViewType) => void;
	requestBeginEditingNewItem: (orderingNumber: number, category?: 'weekly' | 'project') => void;
	requestBeginEditingExistingItem: (item: ItemType) => void;
	moveItemScheduleTimeByWeeks: (item: ItemType, weekOffset: number, follow?: boolean, select?: boolean) => void;
	moveItemScheduleTimeToThisWeek: (item: ItemType, weekOffset?: number, follow?: boolean, select?: boolean) => void;
	requestGoToToday: () => void;
	requestWeekChange: (weekOffset: number) => void;

	// slowly remove these from component and handle yourself with request types
	setInternalCopiedItem: (item: ItemType) => void;
	setSettingPage: (p: SettingPageType) => void;
	setSelectedId: (id: number | null) => void;

	// gotoSectionRelative: (offset: number) => void;
	// setWeekReference: (wr: number) => void;
	// gotoWeekRelative: (offset: number) => void;

};

export const useAppLogic = create<AppLogic>((set, get) => ({
	pageView: 'This Week',
	settingPage: 'Calendars',
	weekReference: (new Date()).getTime(),
	internalCopiedItem: null,
	selectedId: null,

	weeklyItems: [],
	projectItems: [],
	editingNewItem: null,
	editingExistingItem: null,
	setWeeklyItems: (items) => set({ weeklyItems: items }),
	setProjectItems: (items) => set({ projectItems: items }),
	setEditingNewItems: (item) => set({ editingNewItem: item }),
	setEditingExistingItems: (item) => set({ editingExistingItem: item }),

	requestPageViewChange: (page) => set({ pageView: page }),
	requestBeginEditingNewItem: (orderingNumber: number, category?: 'weekly' | 'project') => {
		if (get().editingExistingItem || get().editingNewItem) return;
		createNewEditingItem(orderingNumber);
	},
	requestBeginEditingExistingItem: (item) => {
		if (get().editingExistingItem || get().editingNewItem) return;
		createExistingEditingItem(item);
	},
	moveItemScheduleTimeByWeeks: (item, weekOffset, follow = true, select = true) => {
		if (get().editingExistingItem || get().editingNewItem) return;
		const newSchedule = item.scheduledAt + (weekOffset * MILLISECONDS_IN_WEEK);
		updateItem({ ...item, scheduledAt: newSchedule, });
		if (follow) set({ weekReference: newSchedule });
		if (select) set({ selectedId: item.id });
	},
	moveItemScheduleTimeToThisWeek: (item, weekOffset = 0, follow = true, select = true) => {
		if (get().editingExistingItem || get().editingNewItem) return;
		const newSchedule = (new Date()).getTime() + (weekOffset * MILLISECONDS_IN_WEEK);
		updateItem({ ...item, scheduledAt: newSchedule, });
		if (follow) set({ weekReference: newSchedule });
		if (select) set({ selectedId: item.id });
	},
	requestGoToToday: () => {
		if (get().editingExistingItem || get().editingNewItem) return false;
		set({ weekReference: (new Date()).getTime() });
		return true;
	},
	requestWeekChange: (weekOffset) => {
		const currentState = get();
		if (currentState.editingExistingItem || currentState.editingNewItem) return;
		set({ weekReference: currentState.weekReference + (weekOffset * MILLISECONDS_IN_WEEK) })
	},


	// gotoSectionRelative: (offset: number) => {
	// 	if (get().pageView === 'This Week') {
	// 		get().gotoWeekRelative(offset);
	// 	}
	// },
	setInternalCopiedItem: (item: ItemType) => {
		navigator.clipboard.writeText(item.title);
		set({ internalCopiedItem: item });
		console.log("smart copy done.");
	},
	setSettingPage: (p) => set({ settingPage: p }),
	setSelectedId: (id) => set({ selectedId: id }),

	// setWeekReference: (wr) => set({ weekReference: wr }),
	// gotoWeekRelative: (offset) => set({ weekReference: get().weekReference + (offset * MILLISECONDS_IN_WEEK) }),
}));


