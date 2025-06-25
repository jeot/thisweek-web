import { useLiveQuery } from "dexie-react-hooks";
import { NewItemInput } from "./AddNewItem";
import { Item } from "@/components/Item"
import * as keymap from '@/lib/keymaps';
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { addNewItem, updateItem } from "@/lib/items";
import { db } from "@/lib/db";

// let mycount: number = 0;

interface ListOfItemsProps {
  startUtcMillis: number;
  endUtcMillis: number;
}
interface NewItemType {
  position: number | 'top' | 'bottom';
  type: 'todo' | 'note';
}

export function ListOfItems({ startUtcMillis, endUtcMillis }: ListOfItemsProps) {

  const [newItem, setNewItem] = useState<NewItemType | null>(null);

  async function cancelNewItem() {
    setNewItem(null);
  }

  async function handleAddNewItem(title: string, type: 'todo' | 'note') {
    addNewItem(title, type);
    setNewItem(null);
  }

  const items = useLiveQuery(
    async () => {
      // Query Dexie's API
      const items = await db.items
        // .where('age')
        // .between(startUtcMillis, endUtcMillis)
        .toArray();
      // Return result
      return items;
    },
    // specify vars that affect query:
    [startUtcMillis, endUtcMillis]
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    const unliten = keymap.listen((action: string) => { setAction(action) });
    return () => {
      unliten();
    }
  }, []);

  const itemsLength = items?.length || 0;

  useEffect(() => {
    if (!action) return;
    if (!items) return;
    const selectedIndexNotValid = (selectedIndex !== null && ((selectedIndex < 0) || (selectedIndex >= itemsLength)));
    // do these things based on selected item
    if (action === 'up') {
      if (selectedIndex === null || selectedIndexNotValid) setSelectedIndex(itemsLength - 1);
      else if (selectedIndex === 0) return;
      else setSelectedIndex(selectedIndex - 1);
    }
    if (action === 'down') {
      if (selectedIndex === null || selectedIndexNotValid) setSelectedIndex(0);
      else if (selectedIndex === itemsLength - 1) return;
      else setSelectedIndex(selectedIndex + 1);
    }
    if (action === 'cancel') {
      if (selectedIndex !== null) {
        setSelectedIndex(null);
      }
      if (newItem !== null) {
        setNewItem(null);
      }
    }
    if (action === 'delete') {
      if (selectedIndex === null || selectedIndexNotValid) {
        setSelectedIndex(null);
        return;
      } else {
        let item = items[selectedIndex];
        db.items.delete(item.id)
        if (selectedIndex === itemsLength - 1) setSelectedIndex(null);
      }
    }
    if (action === 'toggle_status') {
      if (selectedIndex === null || selectedIndexNotValid) {
        setSelectedIndex(null);
        return;
      } else {
        const item = items[selectedIndex];
        const newStatus = item.status === 'done' ? 'undone' : 'done';
        updateItem({ ...item, status: newStatus });
      }
    }
    if (action === 'create_item') {
      if (selectedIndex === null || selectedIndexNotValid) setNewItem({ position: 'bottom', type: 'todo' });
      else setNewItem({ position: selectedIndex, type: 'todo' });
      setSelectedIndex(null)
    }
    if (action === 'create_item_above') {
      if (selectedIndex === null || selectedIndexNotValid || selectedIndex === 0) setNewItem({ position: 'top', type: 'todo' });
      else setNewItem({ position: selectedIndex - 1, type: 'todo' });
      setSelectedIndex(null)
    }
    if (action === 'toggle_item_type') {
      if (newItem === null) return;
      const type = (newItem.type === 'todo') ? 'note' : 'todo';
      setNewItem({ ...newItem, type: type });
    }

    setAction(null);
    return () => { }
  }, [action, selectedIndex, itemsLength, items, newItem]);

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
      {items?.map((item, i) => {
        console.log(item);
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

export function ListOfItemsContainer() {

  return (
    <div className="flex flex-col max-w-xl w-full gap-4">
      <h2>Todos/Notes</h2>
      <ListOfItems startUtcMillis={18} endUtcMillis={65} />
    </div>
  );
}
