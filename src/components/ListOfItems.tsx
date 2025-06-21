import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db.ts";
import { NewItemInput } from "./AddNewItem";
import { Item } from "@/components/Item"
import * as keymap from '@/lib/keymaps';
import { useEffect, useState } from "react";

// let mycount: number = 0;

export function ListOfItems({ startUtcMillis, endUtcMillis }: { startUtcMillis: number, endUtcMillis: number }) {
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

  function handleKeymapCallback(action: string): void {
    const len = items?.length;
    if (!len) return;
    // do these things based on selected item
    if (action === 'up') {
      if (selectedIndex === null) setSelectedIndex(len - 1);
      else if (selectedIndex === 0) return;
      else setSelectedIndex(selectedIndex - 1);
    }
    if (action === 'down') {
      if (selectedIndex === null) setSelectedIndex(0);
      else if (selectedIndex === len - 1) return;
      else setSelectedIndex(selectedIndex + 1);
    }
    if (action === 'cancel') {
      if (selectedIndex !== null) {
        setSelectedIndex(null);
      }
    }
    if (action === 'delete') {
      if (selectedIndex === null) return;
      else {
        let item = items[selectedIndex];
        db.items.delete(item.id)
      }
    }
    if (action === 'toggle_status') {
      if (selectedIndex === null) return;
      else {
        let item = items[selectedIndex];
        item.status = item.status === 'done' ? 'undone' : 'done';
        db.items.update(item.id, item)
      }
    }
  }

  useEffect(() => {
    const unliten = keymap.listen(handleKeymapCallback);
    return () => {
      unliten();
    }
  }, [selectedIndex, items]);

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl items-center gap-2">
      {items?.map((item, i) => {
        return (
          <Item key={item.id} item={item} selected={(selectedIndex === i)} />
        );
      })}
    </div>
  );
}

export function ListOfItemsContainer() {
  return (
    <div className="flex flex-col max-w-xl w-full gap-4">
      <h2>Todos/Notes</h2>
      <ListOfItems startUtcMillis={18} endUtcMillis={65} />

      <h2>Add New Item</h2>
      <NewItemInput />
    </div>
  );
}
