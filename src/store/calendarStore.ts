import { create } from 'zustand';
import { DEFAULT_SECOND_CAL_LOC, DEFAULT_MAIN_CAL_LOC, saveAppConfigToIDBPartial } from '@/lib/appConfigIDB';
import { CalendarLocaleType, LocaleType } from '@/types/types';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
// https://gist.github.com/dfa1234/a468fb75ca2ccd11599de622b8b60449
// calendar?: 'buddhist' | 'chinese' | 'coptic' | 'ethiopia' | 'ethiopic' | 'gregory' | 'hebrew' | 'indian' | 'islamic' | 'iso8601' | 'japanese' | 'persian' | 'roc',

// const calendars = ['buddhist', 'chinese', 'coptic', 'ethiopia', 'ethiopic', 'gregory', 'hebrew', 'indian', 'islamic', 'iso8601', 'japanese', 'persian', 'roc']

type CalendarState = {
	mainCal: CalendarLocaleType;
	secondCal: CalendarLocaleType;
	secondCalEnabled: boolean;
	setMainCal: (cl: CalendarLocaleType, save?: boolean) => void;
	// setMainCalCalendar: (cal: CalendarType) => void;
	setMainCalLocale: (loc: LocaleType, save?: boolean) => void;
	setSecondCal: (cl: CalendarLocaleType, save?: boolean) => void;
	setSecondCalLocale: (loc: LocaleType, save?: boolean) => void;
	setSecondCalEnabled: (en: boolean, save?: boolean) => void;
};

export const useCalendarState = create<CalendarState>((set, get) => ({
	mainCal: DEFAULT_MAIN_CAL_LOC,
	secondCal: DEFAULT_SECOND_CAL_LOC,
	secondCalEnabled: false,
	setMainCal: (cl, save = true) => {
		set({ mainCal: cl });
		if (save) saveAppConfigToIDBPartial({ mainCalendar: cl });
	},
	// setMainCalCalendar: (cal) => set({ mainCal: { ...get().mainCal, calendar: cal } }),
	setMainCalLocale: (loc, save = true) => {
		const cl = { ...get().mainCal, locale: loc };
		set({ mainCal: cl });
		if (save) saveAppConfigToIDBPartial({ mainCalendar: cl });
	},
	setSecondCal: (cl, save = true) => {
		set({ secondCal: cl });
		if (save) saveAppConfigToIDBPartial({ secondCalendar: cl });
	},
	setSecondCalLocale: (loc, save = true) => {
		const cl = { ...get().secondCal, locale: loc };
		set({ secondCal: cl });
		if (save) saveAppConfigToIDBPartial({ secondCalendar: cl });
	},
	setSecondCalEnabled: (en, save = true) => {
		set({ secondCalEnabled: en });
		if (save) saveAppConfigToIDBPartial({ secondCalendarEnabled: en });
	}
}));


