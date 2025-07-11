import { Badge } from "@/components/ui/badge"
import { getDateViewInLocaleCalendar } from "@/lib/week";
import { useCalendarState } from "@/store/calendarStore";
import { DateTime } from "luxon";

export default function HeaderContent({ title }: { title?: string }) {
  const mainCal = useCalendarState((state) => state.mainCal);
  const secondCal = useCalendarState((state) => state.secondCal);
  const secondCalEnabled = useCalendarState((state) => state.secondCalEnabled);

  const today = getDateViewInLocaleCalendar(DateTime.now(), mainCal.locale.locale, mainCal.calendar, mainCal.locale.direction);
  const today2 = getDateViewInLocaleCalendar(DateTime.now(), secondCal.locale.locale, secondCal.calendar, secondCal.locale.direction);

  return (
    <div className="h-full flex items-center justify-between px-2 py-1">
      {title === "This Week"
        && <h1>This<span className="font-normal">Week</span></h1>
        || <h1 className="flex-none">{title}</h1>}
      <div className="h-full flex flex-wrap items-center justify-end">
        <Badge variant="secondary" className="mx-1 font-normal"
          dir={today.direction}>{today.localeDisplay}
        </Badge>
        {secondCalEnabled &&
          <Badge variant="secondary" className="mx-1 font-normal text-primary/75 bg-primary/10"
            dir={today2.direction}>{today2.localeDisplay}
          </Badge>
        }
      </div>
    </div >
  );
}
