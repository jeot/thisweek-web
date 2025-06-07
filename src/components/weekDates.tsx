import { buildFullWeekView } from "@/lib/week";
import { Separator } from "@/components/ui/separator"
import { Button } from "./ui/button";
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { cn } from "@/lib/utils";

function WeekDates({ className, ...props }: React.ComponentProps<"div">) {

  const mainCal = useCalendarState((state) => state.mainCal);
  const secondCal = useCalendarState((state) => state.secondCal);
  const weekReference = useWeekState((state) => state.weekReference);

  const weekView = buildFullWeekView(weekReference, mainCal, secondCal);

  return (
    <div
      className={cn("grid grid-cols-7 place-content-around gap-2", className)}
      {...props}
    >
      {weekView.dates.map((dv, i) => {
        return (
          <div className="border-0 text-center min-w-full">
            <div className="text-xs text-center uppercase text-primary/25">
              {dv.parts.weekdayShort}
            </div>
            <Button
              variant="ghost"
              // variant="outline"
              className="px-2 py-6 justify-center w-full"
            >
              <div>
                <div className="text-base font-semibold">
                  {dv.parts.day}
                </div>

                {weekView.dates2 && <Separator />}
                {weekView.dates2 &&
                  <div className="text-sm text-primary/50">
                    {weekView.dates2[i].parts.day}
                  </div>
                }
              </div>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export { WeekDates }
