import { create } from 'zustand';

type WeekState = {
	weekReference: number;
	setWeekReference: (wr: number) => void;
	resetWeekReference: () => void;
};

export const useWeekState = create<WeekState>((set) => ({
	weekReference: (new Date()).getTime(),
	setWeekReference: (wr) => set({ weekReference: wr }),
	resetWeekReference: () => set({ weekReference: (new Date()).getTime() }),
}));


