import { create } from 'zustand';
import { CalendarLocaleType, LocaleType } from '@/types/types';
import locales from '../types/locales.json';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
// https://gist.github.com/dfa1234/a468fb75ca2ccd11599de622b8b60449
// calendar?: 'buddhist' | 'chinese' | 'coptic' | 'ethiopia' | 'ethiopic' | 'gregory' | 'hebrew' | 'indian' | 'islamic' | 'iso8601' | 'japanese' | 'persian' | 'roc',

// const calendars = ['buddhist', 'chinese', 'coptic', 'ethiopia', 'ethiopic', 'gregory', 'hebrew', 'indian', 'islamic', 'iso8601', 'japanese', 'persian', 'roc']

type CalendarState = {
	mainCal: CalendarLocaleType;
	secondCal: CalendarLocaleType | null;
	setMainCal: (cw: CalendarLocaleType) => void;
	setSecondCal: (cw: CalendarLocaleType | null) => void;
};

const defaultEnUSLocale: LocaleType = {
	locale: "en-US",
	language: "English",
	region: "United States",
	nativeName: "English",
	flag: "🇺🇸",
	direction: "ltr"
};

const secondaryFaIRLocale: LocaleType = {
	locale: "fa-IR",
	language: "Persian",
	region: "Iran",
	nativeName: "فارسی",
	flag: "🇮🇷",
	direction: "rtl"
};

export const useCalendarState = create<CalendarState>((set) => ({
	mainCal: { calendar: 'gregory', locale: defaultEnUSLocale, weekStartsOn: 'mon' },
	// secondCal: null,
	secondCal: { calendar: 'persian', locale: secondaryFaIRLocale, weekStartsOn: 'sat' },
	setMainCal: (cw) => set({ mainCal: cw }),
	setSecondCal: (cw) => set({ secondCal: cw }),
}));


