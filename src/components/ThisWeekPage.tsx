import { WeekDatesCard } from '@/components/weekDatesCard';
import { ListOfItems } from '@/components/ListOfItems';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { getUtcRangeForLocalWeekByRefMillis } from "@/lib/week";
import { checkAndFixOrdering, checkEditingIntegrity, getItemsInWeeklyRange } from '@/lib/items';
import { useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { useSwipe } from '@/lib/useSwipe';


export function ThisWeekPage() {
  const mainCal = useCalendarState((state) => state.mainCal);
  const weekReference = useWeekState((state) => state.weekReference);
  const setWeekReference = useWeekState((state) => state.setWeekReference);
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

  const existingEdit = useLiveQuery(async () => {
    return (await db.editing.get('editing_existing'))?.item ?? null;
  });

  const newEdit = useLiveQuery(async () => {
    return (await db.editing.get('editing_new'))?.item ?? null;
  });

  useEffect(() => {
    checkEditingIntegrity();
    if (existingEdit) {
      setWeekReference(existingEdit.scheduledAt);
    }
    if (newEdit) {
      setWeekReference(newEdit.scheduledAt);
    }
  }, [newEdit, existingEdit]);

  const boxRef = useRef<HTMLDivElement>(null);

  useSwipe(boxRef, {
    onSwipe: (dir) => {
      console.log(`Swiped ${dir}`);
      // your logic for left/right swipe here
    },
  });

  return (
    <div ref={boxRef} className="flex flex-col w-full flex-1 p-4 gap-4 items-center">
      <div className="flex w-full justify-center mb-2">
        <WeekDatesCard />
      </div>
      {/* container for lsit of items */}
      <div className="flex flex-col min-w-64 w-full md:w-xl items-center gap-4">
        <h2>Todos &amp; Notes</h2>
        <ListOfItems items={items} newEdit={newEdit} existingEdit={existingEdit} />
      </div>
    </div>
  );
}

