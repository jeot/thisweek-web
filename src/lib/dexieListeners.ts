// dbSync.ts
import { useLiveQuery } from "dexie-react-hooks";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import { getItemsInWeeklyRange } from "./items";
import { getUtcRangeForLocalWeekByRefMillis } from "./week";
import { db } from '@/lib/db';
import { useEffect } from "react";

export function useLocalDbSyncItems() {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const weekReference = useAppLogic((state) => state.weekReference);
  const [startUtcMillis, endUtcMillis] = getUtcRangeForLocalWeekByRefMillis(mainCal.weekStartsOn, weekReference);
  // for pushing into zustand whenever items update
  const setWeeklyItems = useAppLogic((state) => state.setWeeklyItems);
  const setProjectItems = useAppLogic((state) => state.setProjectItems);
  const setEditingNewItems = useAppLogic((state) => state.setEditingNewItems);
  const setEditingExistingItems = useAppLogic((state) => state.setEditingExistingItems);

  // This will re-run whenever the table changes
  const weeklyItems = useLiveQuery(
    async () => {
      return getItemsInWeeklyRange(startUtcMillis, endUtcMillis);
    },
    // specify vars that affect query:
    [startUtcMillis, endUtcMillis]
  ) || [];

  const existingEdit = useLiveQuery(async () => {
    return (await db.editing.get('editing_existing'))?.item ?? null;
  });

  const newEdit = useLiveQuery(async () => {
    return (await db.editing.get('editing_new'))?.item ?? null;
  });


  // Update zustand when Dexie emits new results

  useEffect(() => {
    // Only skip when items === undefined (initial/loading state)
    if (weeklyItems === undefined || setWeeklyItems === undefined) return;
    setWeeklyItems(weeklyItems);
    setProjectItems([]);
  }, [weeklyItems, setWeeklyItems]);

  useEffect(() => {
    // Only skip when items === undefined (initial/loading state)
    if (existingEdit === undefined || newEdit === undefined || setEditingNewItems === undefined || setEditingExistingItems === undefined) return;
    setEditingNewItems(newEdit);
    setEditingExistingItems(existingEdit);
  }, [existingEdit, newEdit, setEditingNewItems, setEditingExistingItems]);
}

