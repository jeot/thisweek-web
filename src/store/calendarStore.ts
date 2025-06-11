import { create } from 'zustand';
import { CalendarLocaleType, LocaleType } from '@/types/types';
import { CalendarType } from '@/types/calendarLocales';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
// https://gist.github.com/dfa1234/a468fb75ca2ccd11599de622b8b60449
// calendar?: 'buddhist' | 'chinese' | 'coptic' | 'ethiopia' | 'ethiopic' | 'gregory' | 'hebrew' | 'indian' | 'islamic' | 'iso8601' | 'japanese' | 'persian' | 'roc',

// const calendars = ['buddhist', 'chinese', 'coptic', 'ethiopia', 'ethiopic', 'gregory', 'hebrew', 'indian', 'islamic', 'iso8601', 'japanese', 'persian', 'roc']

type CalendarState = {
	mainCal: CalendarLocaleType;
	secondCal: CalendarLocaleType;
	secondCalEnabled: boolean;
	setMainCal: (cw: CalendarLocaleType) => void;
	setMainCalCalendar: (cal: CalendarType) => void;
	setMainCalLocale: (loc: LocaleType) => void;
	setSecondCal: (cw: CalendarLocaleType) => void;
	setSecondCalLocale: (loc: LocaleType) => void;
	setSecondCalEnabled: (en: boolean) => void;
};

const enUSLocale: LocaleType = {
	locale: "en-US",
	language: "English",
	region: "United States",
	nativeName: "English",
	flag: "🇺🇸",
	direction: "ltr"
};

import localesData from '@/types/locales.json'
import { calendars } from '@/types/calendarLocales'
const test_cal = 'hebrew';
const test_default_loc = calendars.find((cal) => cal.name === test_cal)!;
const test_loc_str = test_default_loc.locales[0].locale;
const test_week_start = test_default_loc.locales[0].startWeekday;
const test_locale: LocaleType = localesData.find((loc) => loc.locale === test_loc_str)! as LocaleType;
const testCal: CalendarLocaleType = {
	calendar: test_cal, locale: test_locale, weekStartsOn: test_week_start
}

const mainCalInit: CalendarLocaleType = {
	calendar: 'gregory', locale: enUSLocale, weekStartsOn: 'mon'
}

const secondCalInit: CalendarLocaleType = testCal;

export const useCalendarState = create<CalendarState>((set, get) => ({
	mainCal: mainCalInit,
	secondCal: secondCalInit,
	secondCalEnabled: false,
	setMainCal: (cw) => set({ mainCal: cw }),
	setMainCalCalendar: (cal) => set({ mainCal: { ...get().mainCal, calendar: cal } }),
	setMainCalLocale: (loc) => set({ mainCal: { ...get().mainCal, locale: loc } }),
	setSecondCal: (cw) => set({ secondCal: cw }),
	setSecondCalLocale: (loc) => set({ secondCal: { ...get().secondCal, locale: loc } }),
	setSecondCalEnabled: (en) => set({ secondCalEnabled: en }),
}));


