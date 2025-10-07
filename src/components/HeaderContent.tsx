import { Badge } from "@/components/ui/badge"
import { getDateViewInLocaleCalendar } from "@/lib/week";
import { useCalendarConfig } from "@/store/calendarConfig";
import { useAppLogic } from "@/store/appLogic";
import { DateTime } from "luxon";
import { LoginSheet } from "./LoginSheet";

export default function HeaderContent({ title }: { title?: string }) {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const requestGoToToday = useAppLogic((state) => state.requestGoToToday);
  // const secondCal = useCalendarState((state) => state.secondCal);
  // const secondCalEnabled = useCalendarState((state) => state.secondCalEnabled);

  const today = getDateViewInLocaleCalendar(DateTime.now(), mainCal.locale.locale, mainCal.calendar, mainCal.locale.direction);
  // const today2 = getDateViewInLocaleCalendar(DateTime.now(), secondCal.locale.locale, secondCal.calendar, secondCal.locale.direction);

  return (
    <div className="h-full flex items-center justify-between px-2 py-1">
      {title === "This Week" &&
        <h1 className="hover:cursor-pointer" onClick={() => requestGoToToday()}>This<span className="font-normal">Week</span></h1>
        || <h1 className="flex-none">{title}</h1>}
      <div className="h-full flex flex-wrap items-center justify-end">
        <Badge variant="ghost" className="mx-1 font-normal hover:bg-secondary hover:cursor-pointer" dir={today.direction}
          onClick={() => requestGoToToday()}
        >
          {today.localeDisplay}
        </Badge>
        &nbsp;
        <LoginSheet />
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
