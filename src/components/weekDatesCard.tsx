import { Button } from "./ui/button";
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { Card, CardContent } from "./ui/card";
import { WeekDates } from "./weekDates";

const MILLISECONDS_IN_WEEK = 604800000;

function WeekDatesCard() {
  const mainCal = useCalendarState((state) => state.mainCal);
  const direction = mainCal.locale.direction;
  const weekReference = useWeekState((state) => state.weekReference);
  const setWeekReference = useWeekState((state) => state.setWeekReference);

  function goPreviousWeek(/*event: MouseEvent<HTMLButtonElement, MouseEvent>*/): void {
    setWeekReference(weekReference - MILLISECONDS_IN_WEEK);
  }

  function goNextWeek(/*event: MouseEvent<HTMLButtonElement, MouseEvent>*/): void {
    setWeekReference(weekReference + MILLISECONDS_IN_WEEK);
  }

  return (
    <Card dir={direction} className="w-full max-w-sm min-w-64">
      {/*<CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>*/}
      <CardContent className="px-2 flex flex-auto gap-1 place-content-around items-center">
        <Button variant="secondary" size="sm" onClick={goPreviousWeek}
          className="w-1/12"
        >&lt;</Button>
        <WeekDates className="w-10/12" />
        <Button variant="secondary" size="sm" onClick={goNextWeek}
          className="w-1/12"
        >&gt;</Button>
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
