import { useLiveQuery } from "dexie-react-hooks";
import { useAppLogic } from "@/store/appLogic";
import { useCalendarConfig } from "@/store/calendarConfig";
import {
  async_checkAndFixOrdering,
  async_getItemsInUtcIsoTimeRange,
  async_getUnsyncedCount,
  async_getItemsInProject,
  async_getProjects,
  async_getProjectsInTrash
} from "./items";
import { getUtcIsoRangeForLocalWeekByRefUtcIso } from "./week";
import { useEffect } from "react";

const EMPTY_UNSYNCED_COUNT = { items: 0, projects: 0 };

export function useLocalDbSyncItems() {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const weekReference = useAppLogic((state) => state.weekReference);
  const activeProjectUuid = useAppLogic((state) => state.activeProjectUuid);
  const [startUtcIso, endUtcIso] = getUtcIsoRangeForLocalWeekByRefUtcIso(mainCal.weekStartsOn, weekReference);
  const setWeeklyItemsForced = useAppLogic((state) => state.setWeeklyItemsForced);
  const setProjectItemsForced = useAppLogic((state) => state.setProjectItemsForced);
  const setProjectsForced = useAppLogic((state) => state.setProjectsForced);
  const setTrashedProjectsForced = useAppLogic((state) => state.setTrashedProjectsForced);
  const setUnsyncedCount = useAppLogic((state) => state.setUnsyncedCount);

  // This will re-run whenever the table or range changes
  const weeklyItems = useLiveQuery(
    async () => {
      return (await async_getItemsInUtcIsoTimeRange(startUtcIso, endUtcIso));
    },
    // specify vars that affect query:
    [startUtcIso, endUtcIso]
  ) || [];

  const projects = useLiveQuery(
    async () => {
      return (await async_getProjects());
    },
    []
  ) || [];

  const trashedProjects = useLiveQuery(
    async () => {
      return (await async_getProjectsInTrash());
    },
    []
  ) || [];

  const projectsItems = useLiveQuery(
    async () => {
      return (await async_getItemsInProject(activeProjectUuid));
    },
    [activeProjectUuid]
  ) || [];

  // get unsynced items count
  const unsyncedCount = useLiveQuery(
    async () => {
      return (await async_getUnsyncedCount());
    }, []);

  useEffect(() => {
    if (!unsyncedCount) {
      setUnsyncedCount(EMPTY_UNSYNCED_COUNT);
      return;
    }
    console.log("setting unsyncedCount.");
    setUnsyncedCount(unsyncedCount);
  }, [unsyncedCount, setUnsyncedCount]);

  // Update zustand when Dexie emits new results
  useEffect(() => {
    console.log("checking...");
    async_checkAndFixOrdering(weeklyItems, 'weekly').then(() => {
      console.log("ordering done");
    }).catch((e) => {
      console.log("ordering error:", e);
    });

    setWeeklyItemsForced(weeklyItems);
  }, [weeklyItems]);

  // projects list
  useEffect(() => {
    setProjectsForced(projects);
  }, [projects]);

  useEffect(() => {
    setTrashedProjectsForced(trashedProjects);
  }, [trashedProjects]);

  // project items
  useEffect(() => {
    async_checkAndFixOrdering(projectsItems, 'project').then(() => {
      console.log("ordering done");
    }).catch((e) => {
      console.log("ordering error:", e);
    });

    setProjectItemsForced(projectsItems);
  }, [projectsItems]);
}
