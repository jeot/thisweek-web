import { create } from 'zustand';

type WeekState = {
	weekReference: number;
	setWeekReference: (wr: number) => void;
};

export const useWeekState = create<WeekState>((set) => ({
	weekReference: (new Date()).getTime(),
	setWeekReference: (wr) => set({ weekReference: wr }),
}));

/*
type WeekState = {
	week: WeekView;
	week2: WeekView | null;
	setWeek: (w: WeekView) => void;
	setWeek2: (w: WeekView | null) => void;
};

export const useWeekState = create<WeekState>((set) => ({
	week: buildWeekView(),
	week2: buildWeekView(),
	setWeek: (w) => set({ week: w }),
	setWeek2: (w) => set({ week2: w }),
}));
*/

