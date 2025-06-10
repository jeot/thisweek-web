import { Badge } from "@/components/ui/badge"
import { getDateViewInLocaleCalendar } from "@/lib/week";
import { useCalendarState } from "@/store/calendarStore";
import { DateTime } from "luxon";

export default function HeaderContent({ title }: { title?: string }) {
  const mainCal = useCalendarState((state) => state.mainCal);
  const secondCal = useCalendarState((state) => state.secondCal);

  const today = getDateViewInLocaleCalendar(DateTime.now(), mainCal.locale.locale, mainCal.calendar, mainCal.locale.direction, "full");
  const today2 = secondCal && getDateViewInLocaleCalendar(DateTime.now(), secondCal.locale.locale, secondCal.calendar, secondCal.locale.direction, "long") || null;

  return (
    <div className="h-full flex items-center justify-between px-2 py-1">
      <h2 className="flex-none">{title}</h2>
      <div className="h-full flex flex-wrap items-center justify-end">
        <Badge variant="secondary" className="mx-1 font-normal" dir={today.direction}>{today.localeDisplay}</Badge>
        {today2 && <Badge variant="secondary" className="mx-1 font-light text-primary/75 bg-primary/10" dir={today2.direction}>{today2.localeDisplay}</Badge>}
      </div>
    </div >
  );
}
