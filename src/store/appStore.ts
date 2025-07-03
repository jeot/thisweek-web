import { ItemType, PageViewType } from '@/types/types';
import { create } from 'zustand';
import { useWeekState } from './weekStore';

type AppState = {
	pageView: PageViewType;
	setPageView: (page: PageViewType) => void;
	gotoSectionRelative: (offset: number) => void;

	internalCopiedItem: ItemType | null;
	setInternalCopiedItem: (item: ItemType) => void;
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
}));


