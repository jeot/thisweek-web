import { Button } from "./ui/button";
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { WeekDates } from "./weekDates";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { buildFullWeekView } from "@/lib/week";
import { useActionListener } from "@/lib/useActionListener";
import { cn } from "@/lib/utils";

function WeekDatesCard() {
  const mainCal = useCalendarState((state) => state.mainCal);
  const secondCal = useCalendarState((state) => state.secondCal);
  const secondCalEnabled = useCalendarState((state) => state.secondCalEnabled);
  const weekReference = useWeekState((state) => state.weekReference);
  const resetWeekReference = useWeekState((state) => state.resetWeekReference);
  const gotoWeekRelative = useWeekState((state) => state.gotoWeekRelative);

  const weekView = buildFullWeekView(weekReference, mainCal, secondCal, secondCalEnabled);
  const defaultDirection = (weekView.direction === 'ltr');

  useActionListener('right', () => {
    gotoWeekRelative(1);
  });

  useActionListener('left', () => {
    gotoWeekRelative(-1);
  });

  useActionListener('today', () => {
    resetWeekReference();
  });

  const NextIcon = defaultDirection ? ChevronRight : ChevronLeft;
  const PrevIcon = defaultDirection ? ChevronLeft : ChevronRight;

  /*
        className={cn("w-full sm:max-w-md min-w-64 pt-3 pb-2 gap-2",
          "transition-all duration-1000 rounded-none sm:rounded-3xl border-0 border-b-1 sm:border shadow-none sm:shadow-sm")}
      */
  return (
    <Card dir={weekView.direction}
      className={cn(
        "w-full min-w-64 gap-2 transition-all duration-300 ease-in-out",
        "max-w-full sm:max-w-md", // animatable width
        "rounded-none sm:rounded-3xl", // smooth rounding already works
        "px-2 sm:px-3 pt-2 pb-2", // smooth padding
        "mt-0 sm:mt-6", // smooth margin
        "border-0 border-b border-border sm:border shadow-none sm:shadow-sm"
      )}
      onContextMenu={(event) => {
        event.stopPropagation();
        console.log("week card onContextMenu");
      }}
    >
      <CardHeader className="gap-0">
        <CardTitle className="text-sm">{weekView.weekTitle}</CardTitle>
        <CardDescription className="text-xs">{weekView.weekDescription}</CardDescription>
      </CardHeader>
      {/*<CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>*/}
      <CardContent className="px-1 flex flex-auto gap-0 place-content-around items-center">
        <Button variant="ghost_dim" size="sm" onClick={() => gotoWeekRelative(-1)}
          className="w-1/12"
        ><PrevIcon /></Button>
        <WeekDates weekView={weekView} className="w-10/12" />
        <Button variant="ghost_dim" size="sm" onClick={() => gotoWeekRelative(1)}
          className="w-1/12"
        ><NextIcon /></Button>
      </CardContent>
      {/*<CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>*/}
    </Card >
  );
}

export { WeekDatesCard }
