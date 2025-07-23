import { WeekDatesCard } from '@/components/weekDatesCard';
import { ListOfItemsContainer } from '@/components/ListOfItems';
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
  const gotoWeekRelative = useWeekState((state) => state.gotoWeekRelative);
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
      if (!existingEdit && !newEdit) {
        if (dir === 'left' && mainCal.locale.direction === 'ltr') gotoWeekRelative(1);
        if (dir === 'right' && mainCal.locale.direction === 'ltr') gotoWeekRelative(-1);
        if (dir === 'left' && mainCal.locale.direction === 'rtl') gotoWeekRelative(-1);
        if (dir === 'right' && mainCal.locale.direction === 'rtl') gotoWeekRelative(1);
      }
    },
  });

  return (
    <div ref={boxRef}
      className="flex flex-col w-full min-h-full flex-1 gap-4 items-center"
      onContextMenu={() => console.log("week page onContextMenu")}
    >
      <div className="flex w-full justify-center mb-2">
        <WeekDatesCard />
      </div>
      {/* container for list of items */}
      <ListOfItemsContainer items={items} newEdit={newEdit} existingEdit={existingEdit} modifiable header={"Tasks & Notes"} />
    </div>
  );
}

