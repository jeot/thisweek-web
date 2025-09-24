import { useLiveQuery } from "dexie-react-hooks";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import { async_checkAndFixOrdering, async_getItemsInMillisTimeRange } from "./items";
import { getUtcRangeForLocalWeekByRefMillis } from "./week";
import { useEffect } from "react";

export function useLocalDbSyncItems() {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const weekReference = useAppLogic((state) => state.weekReference);
  const [startUtcMillis, endUtcMillis] = getUtcRangeForLocalWeekByRefMillis(mainCal.weekStartsOn, weekReference);
  const setWeeklyItemsForced = useAppLogic((state) => state.setWeeklyItemsForced);
  const setProjectItemsForced = useAppLogic((state) => state.setProjectItemsForced);

  // This will re-run whenever the table changes
  const weeklyItems = useLiveQuery(
    async () => {
      return (await async_getItemsInMillisTimeRange(startUtcMillis, endUtcMillis));
    },
    // specify vars that affect query:
    [startUtcMillis, endUtcMillis]
  ) || [];

  // Update zustand when Dexie emits new results
  useEffect(() => {
    // check if it needs reordering
    async_checkAndFixOrdering(weeklyItems).then(() => {
      console.log("ordering done");
    }).catch((e) => {
      console.log("ordering error:", e);
    });

    // Only skip when items === undefined (initial/loading state)
    if (weeklyItems === undefined || setWeeklyItemsForced === undefined) return;
    setWeeklyItemsForced(weeklyItems);
    setProjectItemsForced([]);
  }, [weeklyItems, setWeeklyItemsForced]);
}
