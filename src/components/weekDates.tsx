import { WeekViewType } from "@/lib/week";
import { Separator } from "@/components/ui/separator"
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type WeekDatesProps = {
  weekView: WeekViewType;
  className?: string;
} & React.ComponentProps<"div">;

function WeekDates({ weekView, className, ...props }: WeekDatesProps) {

  return (
    <div
      className={cn("grid grid-cols-7 place-content-around gap-0", className)}
      {...props}
    >
      {weekView.dates.map((dv, i) => {
        return (
          <div key={i} className="min-w-full gap-0">
            <div className="mb-1 text-xxs sm:text-xs text-center uppercase text-primary/40">
              {dv.parts.weekdayShort}
            </div>
            <Button
              variant="ghost"
              // variant="outline"
              className={cn("px-1 py-6 justify-center w-full rounded-2xl",
                dv.today ? "bg-indigo-200 dark:bg-indigo-900" : ""
              )}
            >
              <div className="">
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
    </div >
  );
}

export { WeekDates }
