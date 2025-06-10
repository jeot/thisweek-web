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
