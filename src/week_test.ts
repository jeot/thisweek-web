import { getUtcRangeForLocalWeek, getDaysOfWeekLocal, getDateViewsInLocaleCalendarOfWeekLocal } from "./lib/week"
import { DateTime, Info } from "luxon";

console.log("hello testing");

// convert Date to millis
// var time = new Date();
// var time = new Date("2025-06-06T09:06:54.713+0330");
var time = new Date("2025-06-06T00:00:00.000+0200");
var millis = time.getTime();
console.log("local: ", time.toString());
console.log("iso: ", time.toISOString());
console.log("time: ", time, millis);

// convert millis to Date
var date = new Date(millis);
console.log("date: ", date);
console.log("date-local: ", date.toString());

export function display(range: number[], style: string = "en-US") {
  range.map((value) => {
    const date = new Date(value);
    console.log(value, date.toString());
    console.log(value, date.toLocaleDateString(style), { dateStyle: "full" });
  });
  console.log("\n");
}

// display(getUtcRangeForLocalWeek(0));
// display(getUtcRangeForLocalWeek(1), "de-AU");
// display(getUtcRangeForLocalWeek(6), "fa-IR");

// console.log(getDaysOfWeekLocal(6))

// calendar?: 'buddhist' | 'chinese' | 'coptic' | 'ethiopia' | 'ethiopic' | 'gregory' | 'hebrew' | 'indian' | 'islamic' | 'iso8601' | 'japanese' | 'persian' | 'roc',

const test = getDateViewsInLocaleCalendarOfWeekLocal(
  'sat',
  DateTime.local(),

  // "fa-IR",
  // "ar-EG",
  // "en-US",
  "zh-CH",
  // "de-DE",
  // "am-ET",

  // 'buddhist',
  // 'chinese',
  // 'coptic',
  // 'ethiopia',
  // 'ethiopic',
  // 'gregory',
  // 'hebrew',
  // 'indian',
  // 'islamic',
  // 'iso8601',
  // 'japanese',
  // 'persian',
  'roc',

  "full",
  // "long",
  // "short",
);

// console.log(test);

