import { Button } from "./ui/button";
import { useCalendarConfig } from "@/store/calendarConfig";
import { useAppLogic } from "@/store/appLogic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { WeekDates } from "./weekDates";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { buildFullWeekView } from "@/lib/week";
import { cn } from "@/lib/utils";

function WeekDatesCard() {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const secondCal = useCalendarConfig((state) => state.secondCal);
  const secondCalEnabled = useCalendarConfig((state) => state.secondCalEnabled);
  const weekReference = useAppLogic((state) => state.weekReference);
  const requestWeekChange = useAppLogic((state) => state.requestWeekChange);

  const weekView = buildFullWeekView(weekReference, mainCal, secondCal, secondCalEnabled);
  const defaultDirection = (weekView.direction === 'ltr');

  const NextIcon = defaultDirection ? ChevronRight : ChevronLeft;
  const PrevIcon = defaultDirection ? ChevronLeft : ChevronRight;

  return (
    <div className="w-full flex justify-center items-center">
      <Card dir={weekView.direction}
        className={cn(
          "w-full min-w-64 gap-2 transition-all duration-300 ease-in-out",
          "max-w-full @sm:max-w-md", // animatable width
          "rounded-none @sm:rounded-3xl", // smooth rounding already works
          "px-2 @sm:px-3 pt-2 pb-2", // smooth padding
          "mt-0 mb-2 @sm:mt-2 @sm:mb-0", // smooth margin
          "mx-0 @sm:mx-2", // smooth margin
          "border-0 border-b border-border @sm:border",
          "shadow-none @sm:shadow-sm",
          // "@md:bg-pink-600",
        )}
        onContextMenu={(event) => {
          event.stopPropagation();
          console.log("week card onContextMenu");
        }}
      >
        <CardHeader className="gap-0">
          <CardTitle className="text-sm font-normal">{weekView.weekTitle}</CardTitle>
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
          <Button variant="ghost_dim" size="sm" onClick={() => requestWeekChange(-1)}
            className="w-1/12"
          ><PrevIcon /></Button>
          <WeekDates weekView={weekView} className="w-10/12" />
          <Button variant="ghost_dim" size="sm" onClick={() => requestWeekChange(1)}
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
    </div>
  );
}

export { WeekDatesCard }
