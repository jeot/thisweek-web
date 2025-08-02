import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { CalendarMeta, calendars, CalendarType } from "@/types/calendarLocales"
import localesJson from "@/types/locales.json"
import { useCalendarState } from "@/store/calendarStore"
import { LocaleType } from "@/types/types";
import { Badge } from "./ui/badge";
import { Switch } from "@/components/ui/switch"
import { WeekDatesCard } from "./weekDatesCard";


export function SettingsCalendar() {

  const mainCal = useCalendarState((state) => state.mainCal);
  const setMainCal = useCalendarState((state) => state.setMainCal);
  // const setMainCalLocale = useCalendarState((state) => state.setMainCalLocale);
  const secondCal = useCalendarState((state) => state.secondCal);
  const setSecondCal = useCalendarState((state) => state.setSecondCal);
  // const setSecondCalLocale = useCalendarState((state) => state.setSecondCalLocale);
  const secondCalEnabled = useCalendarState((state) => state.secondCalEnabled);
  const setSecondCalEnabled = useCalendarState((state) => state.setSecondCalEnabled);

  const mainCalendarMeta = calendars.find((cal) => cal.name === mainCal.calendar);
  const secondCalendarMeta = calendars.find((cal) => cal.name === secondCal.calendar);

  const getCalendarLocaleWeekStartDay = (cal: CalendarType, loc?: string) => {
    // change to default locale (first item)
    const locales = calendars.find((v) => v.name === cal)?.locales;
    if (!locales) return undefined;
    const locale = loc ? locales.find((v) => v.locale === loc) : locales[0];
    if (!locale) return undefined;
    const startWeekday = locale.startWeekday;
    const localeValue = localesJson.find((v) => v.locale === locale.locale);
    if (!localeValue) return undefined;

    if (locale) {
      return {
        calendar: cal,
        locale: localeValue as LocaleType,
        weekStartsOn: startWeekday,
      }
    }
    else return undefined;
  }

  // const getLocaleTypeFromLocaleString = (loc: string) => localesJson.find((v) => v.locale === loc) as LocaleType | undefined;

  const handleMainCalCalendarChange = (cal: CalendarType) => {
    const x = getCalendarLocaleWeekStartDay(cal);
    if (x) setMainCal(x);
  }

  const handleMainCalLocaleChange = (loc: string) => {
    const x = getCalendarLocaleWeekStartDay(mainCal.calendar, loc);
    if (x) setMainCal(x);
  }

  const handleSecondCalCalendarChange = (cal: CalendarType) => {
    const x = getCalendarLocaleWeekStartDay(cal);
    if (x) setSecondCal(x);
  }
  const handleSecondCalLocaleChange = (loc: string) => {
    const x = getCalendarLocaleWeekStartDay(secondCal.calendar, loc);
    if (x) setSecondCal(x);
  }

  const CalendarSelector = ({ disabled, selected, onChange, ...props }: { disabled?: boolean, selected: CalendarType, onChange: (cal: CalendarType) => void }) => {
    return (
      <Select disabled={disabled} value={selected} onValueChange={onChange} {...props}>
        <SelectTrigger className="w-full max-w-sm">
          <SelectValue placeholder="Select Calendar" />
        </SelectTrigger>
        <SelectContent>
          {calendars.map((calMeta, index) => {
            return (
              <SelectItem key={index} className="justify-items-start" value={calMeta.name}>
                {calMeta.displayName}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  const LocaleSelector = ({ disabled, selected, calendarMeta, onChange, ...props }: { disabled?: boolean, selected: string, calendarMeta: CalendarMeta | undefined, onChange: (loc: string) => void }) => {
    return (
      <Select disabled={disabled} value={selected} onValueChange={onChange} {...props}>
        <SelectTrigger className="w-full max-w-sm">
          <SelectValue placeholder="Select Language/Region" />
        </SelectTrigger>
        <SelectContent>
          {calendarMeta?.locales.map((calLocMeta, index) => {
            const flag = localesJson.find((v) => v.locale === calLocMeta.locale)?.flag;
            return (
              <SelectItem key={index} className="w-full flex items-center" value={calLocMeta.locale}>
                <div className="flex-1 text-left">{calLocMeta.displayName}</div>
                <Badge className="flex-none text-xs ml-auto font-mono" variant="secondary">{calLocMeta.locale}&nbsp;{flag}</Badge>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3">
      <h2 className="mt-2">Main Calendar</h2>

      <CalendarSelector selected={mainCal.calendar} onChange={handleMainCalCalendarChange} />
      <LocaleSelector selected={mainCal.locale.locale} calendarMeta={mainCalendarMeta} onChange={handleMainCalLocaleChange} />

      <div className="flex items-baseline space-x-5">
        <h2 className="mt-4">Second Calendar</h2>
        <Switch checked={secondCalEnabled} onCheckedChange={setSecondCalEnabled} />
      </div>

      <CalendarSelector disabled={!secondCalEnabled} selected={secondCal.calendar} onChange={handleSecondCalCalendarChange} />
      <LocaleSelector disabled={!secondCalEnabled} selected={secondCal.locale.locale} calendarMeta={secondCalendarMeta} onChange={handleSecondCalLocaleChange} />

      <h3 className="mt-4 text-primary/50">Week Card Preview</h3>
      <WeekDatesCard />
    </div>
  );
}

