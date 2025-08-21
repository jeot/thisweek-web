import { WeekDatesCard } from '@/components/weekDatesCard';
import { ListOfItemsContainer } from '@/components/ListOfItems';
import { useCalendarConfig } from "@/store/calendarConfig";
import { useAppLogic } from "@/store/appLogic";
import { useRef } from 'react';
import { useSwipe } from '@/lib/useSwipe';


export function ThisWeekPage() {
  const mainCal = useCalendarConfig((state) => state.mainCal);
  const requestWeekChange = useAppLogic((state) => state.requestWeekChange);
  const eventWeekPageClicked = useAppLogic((state) => state.eventWeekPageClicked);
  const items = useAppLogic((state) => state.weeklyItems);
  const editingNewItem = useAppLogic((state) => state.editingNewItem);
  const editingExistingItem = useAppLogic((state) => state.editingExistingItem);

  const boxRef = useRef<HTMLDivElement>(null);

  useSwipe(boxRef, {
    onSwipe: (dir) => {
      console.log(`Swiped ${dir}`);
      if (dir === 'left' && mainCal.locale.direction === 'ltr') requestWeekChange(1);
      if (dir === 'right' && mainCal.locale.direction === 'ltr') requestWeekChange(-1);
      if (dir === 'left' && mainCal.locale.direction === 'rtl') requestWeekChange(-1);
      if (dir === 'right' && mainCal.locale.direction === 'rtl') requestWeekChange(1);
    },
  });

  return (
    <div ref={boxRef}
      className="flex flex-col w-full min-h-full flex-1 gap-2 items-center"
      onClick={(event) => {
        event.stopPropagation();
        console.log("week page click...");
        eventWeekPageClicked();
      }}
    >
      <div className="flex w-full justify-center">
        <WeekDatesCard />
      </div>
      {/* container for list of items */}
      <ListOfItemsContainer className="" items={items} newEdit={editingNewItem} existingEdit={editingExistingItem} modifiable />
    </div>
  );
}

