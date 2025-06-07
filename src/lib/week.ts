import { CalendarLocaleType, weekdayMap, WeekdayType } from "@/types/types";
import { DateTime, Info } from "luxon";

// todo: change all referenceDate from DateTime to millis timestamp (number)
// this is must for all db quary and week range setting will be based on millis timestamp

/**
 * Get UTC start and end timestamps for the week that includes `referenceDate`,
 * using the specified start day of the week.
 *
 * @param weekStartsOn - Number 0 (Sunday) to 6 (Saturday)
 * @param referenceDate - DateTime (optional, defaults to now)
 * @returns [startUtcMillis, endUtcMillis]
 */
export function getUtcRangeForLocalWeek(
  weekStartsOn: number = 0,
  referenceDate: DateTime = DateTime.local()
): [number, number] {
  // Luxon: 1 (Mon) to 7 (Sun) -> Convert to JS 0–6 system
  const weekday = referenceDate.weekday % 7;
  const daysToSubtract = (weekday - weekStartsOn + 7) % 7;
  const startOfWeekLocal = referenceDate.minus({ days: daysToSubtract }).startOf("day");
  const endOfWeekLocal = startOfWeekLocal.plus({ days: 6 }).endOf("day");

  return [
    startOfWeekLocal.toUTC().toMillis(),
    endOfWeekLocal.toUTC().toMillis()
  ];
}


export function getDaysOfWeekLocal(
  weekStartsOn: number = 0,
  referenceDate: DateTime = DateTime.local()
): DateTime[] {
  // Luxon: 1 (Mon) to 7 (Sun) -> Convert to JS 0–6 system
  const weekday = referenceDate.weekday % 7;
  const daysToSubtract = (weekday - weekStartsOn + 7) % 7;
  const startOfWeekLocal = referenceDate.minus({ days: daysToSubtract }).startOf("day");

  const days: DateTime[] = [];

  for (let i = 0; i < 7; i++) {
    days.push(startOfWeekLocal.plus({ days: i }));
  }

  return days;
}

/* luxon DateTime functions:
dt.toLocaleString(DateTime.DATE_SHORT);   // e.g., 6/6/25
dt.toLocaleString(DateTime.DATE_MED);     // e.g., Jun 6, 2025
dt.toLocaleString(DateTime.DATE_FULL);    // e.g., Friday, June 6, 2025
dt.toLocaleString(DateTime.DATETIME_MED); // e.g., Jun 6, 2025, 3:30 PM
*/

export interface DateView {
  originalDateTime: DateTime; // todo: no need!
  // todo: millisUTC
  // todo: timezone city
  // todo: timezone offset number
  gregoryDisplay: string;
  localeDisplay: string;
  parts: {
    day: string;
    month: string;
    year: string;
    weekdayShort: string;
    weekdayLong: string;
    monthName: string;
    yearName?: string;
    era?: string;
  };
};

/*
  interface DateTimeFormatOptions {
      localeMatcher?: "best fit" | "lookup" | undefined;
      weekday?: "long" | "short" | "narrow" | undefined;
      era?: "long" | "short" | "narrow" | undefined;
      year?: "numeric" | "2-digit" | undefined;
      month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined;
      day?: "numeric" | "2-digit" | undefined;
      hour?: "numeric" | "2-digit" | undefined;
      minute?: "numeric" | "2-digit" | undefined;
      second?: "numeric" | "2-digit" | undefined;
      timeZoneName?: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" | undefined;
      formatMatcher?: "best fit" | "basic" | undefined;
      hour12?: boolean | undefined;
      timeZone?: string | undefined;
  }
*/

function getParts(dt: DateTime, locale: string, calendar: string) {
  const formatters = [
    new Intl.DateTimeFormat(locale, {
      calendar,
      day: "numeric",
      month: "numeric",
      year: "numeric",
      weekday: "short",
    }),
    new Intl.DateTimeFormat(locale, {
      calendar,
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    })
  ];

  const parts1 = formatters[0].formatToParts(dt.toJSDate());
  const parts2 = formatters[1].formatToParts(dt.toJSDate());
  // console.log("parts1:", parts1);
  // console.log("parts2:", parts2);

  const get = (parts: any[], type: string) => parts.find(p => p.type === type)?.value || undefined;

  return {
    day: get(parts1, "day"),
    month: get(parts1, "month"),
    year: get(parts1, "year") || get(parts1, "relatedYear"),
    weekdayShort: get(parts1, "weekday"),
    weekdayLong: get(parts2, "weekday"),
    monthName: get(parts2, "month"),
    era: get(parts2, "era"),
    yearName: get(parts2, "yearName"),
  };
}

export function getDateViewsInLocaleCalendarOfWeekLocal(
  weekStartsOn: WeekdayType = 'mon',
  referenceDate: DateTime = DateTime.local(),
  locale: string = "en-US",
  calendar: string = "gregory",
  dateStyle: string = "full",
): DateView[] {
  const weekStartsOnNumber = weekdayMap[weekStartsOn];
  const dates = getDaysOfWeekLocal(weekStartsOnNumber, referenceDate);
  return dates.map((d) => {
    const date = d.setLocale(locale); // eg. "fa-IR"
    const opt = { calendar: calendar, dateStyle: dateStyle };
    const parts = getParts(date, locale, calendar);
    // console.log(parts);
    return {
      originalDateTime: date,
      gregoryDisplay: date.toString(),
      localeDisplay: date.toLocaleString(opt),
      parts: parts,
    }
  });
}

export interface WeekView {
  weekTitle: string;
  weekDesc: string;
  direction: 'ltr' | 'rtl';
  dates: DateView[];
  dates2: DateView[] | null;
}

export function buildFullWeekView(refMillisUTC: number, mainCal: CalendarLocaleType, secondCal: CalendarLocaleType | null): WeekView {
  const dt = DateTime.fromMillis(refMillisUTC);
  // console.log(dt.toString());
  const weekStartsOn = mainCal.weekStartsOn; // should be same for both date views
  const direction = mainCal.locale.direction; // should be same for both date views
  const result: WeekView = {
    weekTitle: "week title",
    weekDesc: "week description",
    direction: direction,
    dates: getDateViewsInLocaleCalendarOfWeekLocal(
      weekStartsOn,
      dt,
      mainCal.locale.locale,
      mainCal.calendar,
      "full",
    ),
    dates2: secondCal ? getDateViewsInLocaleCalendarOfWeekLocal(
      weekStartsOn,
      dt,
      secondCal.locale.locale,
      secondCal.calendar,
      "full",
    ) : null,

  };
  return result;
}
