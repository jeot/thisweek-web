import { WeekDatesCard } from '@/components/weekDatesCard';
import { ListOfItems } from '@/components/ListOfItems';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";
import { getUtcRangeForLocalWeekByRefMillis } from "@/lib/week";
import { checkAndFixOrdering, checkEditingIntegrity, getItemsInWeeklyRange } from '@/lib/items';
import { useEffect } from 'react';
import { db } from '@/lib/db';

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

  return (
    <div className="p-4">
      <div className="flex justify-center">
        <WeekDatesCard />
      </div>
      <p>&nbsp;</p>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col max-w-xl w-full gap-4">
          <h2>Todos/Notes</h2>
          <ListOfItems items={items} newEdit={newEdit} existingEdit={existingEdit} />
        </div>
      </div>
    </div>
  );
}

