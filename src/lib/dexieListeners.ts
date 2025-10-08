import { useLiveQuery } from "dexie-react-hooks";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import { async_checkAndFixOrdering, async_getItemsInUtcIsoTimeRange, async_getUnsyncedItemsCount } from "./items";
import { getUtcIsoRangeForLocalWeekByRefUtcIso } from "./week";
import { useEffect } from "react";

export function useLocalDbSyncItems() {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const weekReference = useAppLogic((state) => state.weekReference);
  const [startUtcIso, endUtcIso] = getUtcIsoRangeForLocalWeekByRefUtcIso(mainCal.weekStartsOn, weekReference);
  const setWeeklyItemsForced = useAppLogic((state) => state.setWeeklyItemsForced);
  const setProjectItemsForced = useAppLogic((state) => state.setProjectItemsForced);
  const setUnsyncedItemsCount = useAppLogic((state) => state.setUnsyncedItemsCount);

  // This will re-run whenever the table or range changes
  const weeklyItems = useLiveQuery(
    async () => {
      return (await async_getItemsInUtcIsoTimeRange(startUtcIso, endUtcIso));
    },
    // specify vars that affect query:
    [startUtcIso, endUtcIso]
  ) || [];

  // get unsynced items count
  const unsyncedCount = useLiveQuery(
    async () => {
      return (await async_getUnsyncedItemsCount());
    }, []) || 0;

  useEffect(() => {
    setUnsyncedItemsCount(unsyncedCount);
  }, [unsyncedCount]);

  // Update zustand when Dexie emits new results
  useEffect(() => {
    // check if it needs reordering
    // todo: this should not happen inbetween the syncs!
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
