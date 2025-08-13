import { MILLISECONDS_IN_WEEK } from '@/lib/week';
import { create } from 'zustand';

type WeekState = {
	[x: string]: any;
	weekReference: number;
	setWeekReference: (wr: number) => void;
	resetWeekReference: () => void;
	gotoWeekRelative: (offset: number) => void;
};

export const useWeekState = create<WeekState>((set, get) => ({
	weekReference: (new Date()).getTime(),
	setWeekReference: (wr) => set({ weekReference: wr }),
	resetWeekReference: () => set({ weekReference: (new Date()).getTime() }),
	gotoWeekRelative: (offset) => set({ weekReference: get().weekReference + (offset * MILLISECONDS_IN_WEEK) }),
}));


