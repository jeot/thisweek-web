import { WeekDatesCard } from '@/components/weekDatesCard';
import { ListOfItems } from '@/components/ListOfItems';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { getUtcRangeForLocalWeekByRefMillis } from "@/lib/week";
import { checkAndFixOrdering, getItemsInWeeklyRange } from '@/lib/items';
import { useEffect } from 'react';

export function ThisWeekPage() {
  const mainCal = useCalendarState((state) => state.mainCal);
  const weekReference = useWeekState((state) => state.weekReference);
  const [startUtcMillis, endUtcMillis] = getUtcRangeForLocalWeekByRefMillis(mainCal.weekStartsOn, weekReference);

  const items = useLiveQuery(
    async () => {
      return getItemsInWeeklyRange(startUtcMillis, endUtcMillis);
    },
    // specify vars that affect query:
    [startUtcMillis, endUtcMillis]
  ) || [];

  useEffect(() => {
    checkAndFixOrdering(items);
  }, [items]);


  return (
    <div className="p-4">
      <div className="flex justify-center">
        <WeekDatesCard />
      </div>
      <p>&nbsp;</p>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col max-w-xl w-full gap-4">
          <h2>Todos/Notes</h2>
          <ListOfItems items={items} />
        </div>
      </div>
    </div>
  );
}

