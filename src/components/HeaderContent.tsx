import { Badge } from "@/components/ui/badge"
import { getDateViewInLocaleCalendar } from "@/lib/week";
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { DateTime } from "luxon";
import { useAppState } from "@/store/appStore";
import { CloudIcon, CloudOffIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function HeaderContent({ title }: { title?: string }) {
  const mainCal = useCalendarState((state) => state.mainCal);
  const resetWeekReference = useWeekState((state) => state.resetWeekReference);
  // const secondCal = useCalendarState((state) => state.secondCal);
  // const secondCalEnabled = useCalendarState((state) => state.secondCalEnabled);

  const today = getDateViewInLocaleCalendar(DateTime.now(), mainCal.locale.locale, mainCal.calendar, mainCal.locale.direction);
  // const today2 = getDateViewInLocaleCalendar(DateTime.now(), secondCal.locale.locale, secondCal.calendar, secondCal.locale.direction);

  const session = useAppState((state) => state.session);

  return (
    <div className="h-full flex items-center justify-between px-4 py-1">
      {title === "This Week"
        && <h1>This<span className="font-normal">Week</span></h1>
        || <h1 className="flex-none">{title}</h1>}
      <div className="h-full flex flex-wrap items-center justify-end">
        <Badge variant="ghost" className="mx-1 font-normal hover:bg-secondary hover:cursor-pointer" dir={today.direction}
          onClick={() => resetWeekReference()}
        >
          {today.localeDisplay}
        </Badge>
        <Button variant="ghost">
          {session && <CloudIcon className="text-green-600" /> || <CloudOffIcon className="text-gray-500" />}
        </Button>
        {/*
        {secondCalEnabled &&
          <Badge variant="secondary" className="mx-1 font-normal text-primary/75 bg-primary/10"
            dir={today2.direction}>{today2.localeDisplay}
          </Badge>
        }
        */}
      </div>
    </div >
  );
}
