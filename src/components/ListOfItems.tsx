import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db.ts";
import { NewItemInput } from "./AddNewItem";
import { Item } from "@/components/Item"
import * as keymap from '@/lib/keymaps';
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ItemType } from "@/types/types";

// let mycount: number = 0;

interface ListOfItemsProps {
  startUtcMillis: number;
  endUtcMillis: number;
}
export function ListOfItems({ startUtcMillis, endUtcMillis }: ListOfItemsProps) {

  const [newItem, setNewItem] = useState<number | 'top' | 'bottom' | null>(null);

  async function cancelNewItem() {
    setNewItem(null);
  }

  async function addNewItem(item: ItemType) {
    try {
      // Add the new friend!
      const id = await db.items.add({
        title: item.title,
        status: item.status,
      });
      const msg = `Item successfully added. Got id ${id}`;
      console.log(msg);
    } catch (error) {
    }
    setNewItem(null);
  }

  const items = useLiveQuery(
    async () => {
      // Query Dexie's API
      const friends = await db.items
        // .where('age')
        // .between(startUtcMillis, endUtcMillis)
        .toArray();

      // Return result
      return friends;
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
    console.log("new action:", action);
    console.log("selectedIndex:", selectedIndex);
    console.log("itemsLength:", itemsLength);
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
        let item = items[selectedIndex];
        item.status = item.status === 'done' ? 'undone' : 'done';
        db.items.update(item.id, item)
      }
    }
    if (action === 'create_item') {
      if (selectedIndex === null || selectedIndexNotValid) setNewItem('bottom');
      else setNewItem(selectedIndex);
      setSelectedIndex(null)
    }
    if (action === 'create_item_above') {
      if (selectedIndex === null || selectedIndexNotValid || selectedIndex === 0) setNewItem('top');
      else setNewItem(selectedIndex - 1);
      setSelectedIndex(null)
    }

    setAction(null);
    return () => { }
  }, [action, selectedIndex, itemsLength, items]);

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl items-center gap-2">
      {newItem === 'top' && <NewItemInput addNewItem={addNewItem} cancelNewItem={cancelNewItem} />}
      {items?.map((item, i) => {
        return (
          <>
            <Item key={item.id} item={item} selected={(selectedIndex === i)} />
            {newItem !== null && typeof newItem === 'number' && newItem === i && <NewItemInput addNewItem={addNewItem} cancelNewItem={cancelNewItem} />}
          </>
        );
      })}
      {newItem === 'bottom' && <NewItemInput addNewItem={addNewItem} cancelNewItem={cancelNewItem} />}
      {newItem === null && <Button variant="outline" onClick={() => { setNewItem("bottom"); }}>Add New Item</Button>}
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
