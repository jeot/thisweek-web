import { create } from 'zustand';

// Depending on timezone, your results will vary
// const event = new Date("August 19, 1975 23:15:30 GMT+00:00");
// console.log(event.toLocaleTimeString("en-US"));
// // Expected output: "1:15:30 AM"
// console.log(event.toLocaleTimeString("it-IT"));
// // Expected output: "01:15:30"
// console.log(event.toLocaleTimeString("ar-EG"));
// // Expected output: "١٢:١٥:٣٠ ص"

// const now = new Date();
// console.log(now.toLocaleDateString("en-US", { calendar: "Julian", dateStyle: "full" }));
// console.log(now.toLocaleDateString("en-GB", { calendar: "Julian", dateStyle: "full" }));
// console.log(now.toLocaleDateString("fa-IR", { calendar: "Persian", dateStyle: "full" }));
// console.log(now.toLocaleDateString("fa-IR", { calendar: "Islamic", dateStyle: "full" }));

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
// https://gist.github.com/dfa1234/a468fb75ca2ccd11599de622b8b60449
// calendar?: 'buddhist' | 'chinese' | ' coptic' | 'ethiopia' | 'ethiopic' | 'gregory' | ' hebrew' | 'indian' | 'islamic' | 'iso8601' | ' japanese' | 'persian' | 'roc',

// const calendars = ['buddhist', 'chinese', 'coptic', 'ethiopia', 'ethiopic', 'gregory', 'hebrew', 'indian', 'islamic', 'iso8601', 'japanese', 'persian', 'roc']

/*
Here is a list of the main languages that use right to left scripts:
Arabic.
Aramaic.
Azeri.
Dhivehi/Maldivian.
Hebrew.
Kurdish (Sorani)
Persian/Farsi.
Urdu.
*/
const rtlLanguages = ['ar', 'dv', 'he', 'fa', 'ur'];

const dateToDateView = (
	d: Date, locale: string, cal: string,
	dateStyle?: "full" | "long" | "medium" | "short" | undefined
) => {
	const lang = locale.substring(0, 2);
	const dir = rtlLanguages.find((value) => (value == lang)) && "rtl" || "ltr";
	// const dir = "ltr"
	return {
		date: d,
		text: d.toLocaleDateString(locale, { calendar: cal, dateStyle: dateStyle }),
		dir: dir,
	}
}

interface DateView {
	date: Date;
	text: string;
	dir: string;
};

type WeekState = {
	today: DateView;
	today2: DateView;
	setToday: (t: DateView) => void;
	setToday2: (t: DateView) => void;
};

export const useWeekState = create<WeekState>((set) => ({
	today: dateToDateView(new Date, "fa-IR", "persian", "long"),
	today2: dateToDateView(new Date, "en-US", "gregory", "full"),
	setToday: (t) => set({ today: t }),
	setToday2: (t) => set({ today2: t }),
}));


