import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db.ts";
import { NewItemInput } from "./AddNewItem";
import { Item } from "@/components/Item"
import { ItemType } from "@/types/types";

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

  const onItemAction = (action: string, item: ItemType): void => {
    if (action === "Edit") {
    } else if (action === "Copy") {
    } else if (action === "Delete") {
      console.log("deleting id:", item.id);
      db.items.delete(item.id);
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl items-center gap-2">
      {items?.map((item) => {
        return (
          <Item item={item} onItemAction={onItemAction} />
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
