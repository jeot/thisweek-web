import { create } from 'zustand';
import locales from '@/types/locales.json';

// today

interface DateViewForToday {
	date: Date;
	text: string;
	dir: string;
};

type TodayState = {
	today: DateViewForToday;
	today2: DateViewForToday;
	today3: DateViewForToday;
	setToday: (t: DateViewForToday) => void;
	setToday2: (t: DateViewForToday) => void;
	setToday3: (t: DateViewForToday) => void;
};

const dateToDateViewForToday = (
	d: Date, locale: string, cal: string,
	dateStyle?: "full" | "long" | "medium" | "short" | undefined
) => {
	const dir = locales.find((value) => (value.locale === locale))?.direction || "ltr";
	const result: DateViewForToday = {
		date: d,
		text: d.toLocaleDateString(locale, { calendar: cal, dateStyle: dateStyle }),
		dir: dir,
	};
	return result;
}

export const useTodayState = create<TodayState>((set) => ({
	today: dateToDateViewForToday(new Date, "fa-IR", "persian", "long"),
	today2: dateToDateViewForToday(new Date, "en-US", "gregory", "full"),
	today3: dateToDateViewForToday(new Date, "en-US", "gregory", "full"),
	setToday: (t) => set({ today: t }),
	setToday2: (t) => set({ today2: t }),
	setToday3: (t) => set({ today3: t }),
}));


/////// week

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

