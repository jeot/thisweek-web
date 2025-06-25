import { NewItemInput } from "./AddNewItem";
import { Item } from "@/components/Item"
import { useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { addNewItem, deleteItem, updateItem } from "@/lib/items";
import { useActionListener } from "@/lib/useActionListener";
import { ItemType } from "@/types/types";
import { useCalendarState } from "@/store/calendarStore";
import { useWeekState } from "@/store/weekStore";

interface ListOfItemsProps {
  items: ItemType[];
}

interface NewItemType {
  position: number | 'top' | 'bottom';
  type: 'todo' | 'note';
}

export function ListOfItems({ items }: ListOfItemsProps) {
  const [newItem, setNewItem] = useState<NewItemType | null>(null);
  const mainCal = useCalendarState((state) => state.mainCal);
  const weekReference = useWeekState((state) => state.weekReference);

  async function cancelNewItem() {
    setNewItem(null);
  }

  async function handleAddNewItem(title: string, type: 'todo' | 'note') {
    addNewItem(title, type, mainCal.calendar, weekReference);
    setNewItem(null);
  }

  const itemsLength = items.length || 0;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedIndexNotValid = (selectedIndex !== null && ((selectedIndex < 0) || (selectedIndex >= itemsLength)));

  useActionListener('up', () => {
    if (selectedIndex === null || selectedIndexNotValid) setSelectedIndex(itemsLength - 1);
    else if (selectedIndex === 0) return;
    else setSelectedIndex(selectedIndex - 1);
  });

  useActionListener('down', () => {
    if (selectedIndex === null || selectedIndexNotValid) setSelectedIndex(0);
    else if (selectedIndex === itemsLength - 1) return;
    else setSelectedIndex(selectedIndex + 1);
  });

  useActionListener('cancel', () => {
    if (newItem !== null) {
      setNewItem(null);
    } else if (selectedIndex !== null) {
      setSelectedIndex(null);
    } else {
    }
  });

  useActionListener('delete', () => {
    if (selectedIndex === null || selectedIndexNotValid) {
      setSelectedIndex(null);
      return;
    } else {
      let item = items[selectedIndex];
      deleteItem(item);
      if (selectedIndex === itemsLength - 1) setSelectedIndex(null);
    }
  });

  useActionListener('toggle_status', () => {
    if (selectedIndex === null || selectedIndexNotValid) {
      setSelectedIndex(null);
      return;
    } else {
      const item = items[selectedIndex];
      const newStatus = item.status === 'done' ? 'undone' : 'done';
      updateItem({ ...item, status: newStatus });
    }
  });

  useActionListener('create_item', () => {
    if (selectedIndex === null || selectedIndexNotValid) setNewItem({ position: 'bottom', type: 'todo' });
    else setNewItem({ position: selectedIndex, type: 'todo' });
    setSelectedIndex(null)
  });

  useActionListener('create_item_above', () => {
    if (selectedIndex === null || selectedIndexNotValid || selectedIndex === 0) setNewItem({ position: 'top', type: 'todo' });
    else setNewItem({ position: selectedIndex - 1, type: 'todo' });
    setSelectedIndex(null)
  });

  useActionListener('toggle_item_type', () => {
    if (newItem === null) return;
    const type = (newItem.type === 'todo') ? 'note' : 'todo';
    setNewItem({ ...newItem, type: type });
  });

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl items-center gap-2">
      {newItem?.position === 'top' &&
        <NewItemInput itemType={newItem.type} addNewItem={handleAddNewItem} cancelNewItem={cancelNewItem}
          onChangeItemType={() => {
            if (newItem === null) return;
            const type = (newItem.type === 'todo') ? 'note' : 'todo';
            setNewItem({ ...newItem, type: type });
          }}
        />}
      {items.map((item, i) => {
        return (
          <div key={item.id} className="w-full">
            <Item key={item.id} item={item} selected={(selectedIndex === i)} />
            {newItem !== null && typeof newItem.position === 'number' && newItem.position === i &&
              <NewItemInput key={`new-item-${item.id}`} itemType={newItem.type} addNewItem={handleAddNewItem} cancelNewItem={cancelNewItem}
                onChangeItemType={() => {
                  if (newItem === null) return;
                  const type = (newItem.type === 'todo') ? 'note' : 'todo';
                  setNewItem({ ...newItem, type: type });
                }}
              />}
          </div>
        );
      })}
      {newItem?.position === 'bottom' &&
        <NewItemInput itemType={newItem.type} addNewItem={handleAddNewItem} cancelNewItem={cancelNewItem}
          onChangeItemType={() => {
            if (newItem === null) return;
            const type = (newItem.type === 'todo') ? 'note' : 'todo';
            setNewItem({ ...newItem, type: type });
          }}
        />}
      {newItem === null && <Button variant="outline" onClick={() => { setNewItem({ position: 'bottom', type: 'todo' }); }}><CirclePlus />New Item</Button>}
    </div>
  );
}
