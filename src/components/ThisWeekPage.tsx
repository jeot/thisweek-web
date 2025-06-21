import { WeekDatesCard } from '@/components/weekDatesCard';
import { ListOfItemsContainer } from '@/components/ListOfItems';

export function ThisWeekPage() {
  return (
    <div className="p-4">
      <div className="flex justify-center">
        <WeekDatesCard />
      </div>
      <p>&nbsp;</p>
      <div className="flex flex-col justify-center items-center">
        <ListOfItemsContainer />
      </div>
    </div>
  );
}

