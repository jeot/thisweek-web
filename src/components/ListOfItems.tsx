import { Item } from "@/components/Item"
import { useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { applyEditingItem, cancelEditingItem, createExistingEditingItem, createNewEditingItem, deleteItem, getNewOrderingNumber, moveItemToSectionRelative, updateItem } from "@/lib/items";
import { useActionListener } from "@/lib/useActionListener";
import { ItemType } from "@/types/types";
import { useAppState } from "@/store/appStore";

interface ListOfItemsProps {
  items: ItemType[];
  newEdit?: ItemType | null;
  existingEdit?: ItemType | null;
}

export function ListOfItems({ items, newEdit, existingEdit }: ListOfItemsProps) {
  const gotoSectionRelative = useAppState((state) => state.gotoSectionRelative);

  let allItems: Array<ItemType> = [];
  allItems.push(...items);
  if (newEdit) {
    console.log("newEdit:", newEdit);
    allItems.push(newEdit);
  }
  if (existingEdit) {
    console.log("existingEdit:", existingEdit);
    allItems = allItems.map(item =>
      item.id === existingEdit?.id ? existingEdit : item
    );
  }
  allItems.sort((a, b) => a?.order.weekly - b?.order.weekly);

  const itemsLength = items.length || 0;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedIndex: number = items.findIndex((item) => (item.id === selectedId));
  const selectedIndexNotValid = ((selectedIndex < 0) || (selectedIndex >= itemsLength));
  const selectedItem = selectedIndexNotValid ? null : items[selectedIndex];
  const setSelectedIndex = (i: number) => {
    if ((i < 0) || (i >= itemsLength)) {
      setSelectedId(null);
    } else {
      setSelectedId(items[i].id);
    }
  }

  // const [editing, setEditing] = useState<{ id: number, position: 'caret_start' | 'caret_end' | 'select_all' } | null>(null);

  useActionListener('up', () => {
    if (selectedIndexNotValid) setSelectedIndex(itemsLength - 1);
    else if (selectedIndex === 0) return;
    else setSelectedIndex(selectedIndex - 1);
  });

  useActionListener('down', () => {
    if (selectedIndexNotValid) setSelectedIndex(0);
    else if (selectedIndex === itemsLength - 1) return;
    else setSelectedIndex(selectedIndex + 1);
  });

  useActionListener('delete', () => {
    if (!selectedItem) return
    deleteItem(selectedItem);
  });

  useActionListener('toggle_status', () => {
    if (!selectedItem) return
    const newStatus = selectedItem.status === 'done' ? 'undone' : 'done';
    updateItem({ ...selectedItem, status: newStatus });
  });

  useActionListener('create_item', () => {
    const newItemPosition = selectedIndexNotValid ?
      getNewOrderingNumber(items, itemsLength, itemsLength + 1, "weekly") :
      getNewOrderingNumber(items, selectedIndex, selectedIndex + 1, "weekly");
    console.log("newItemPosition:", newItemPosition);
    createNewEditingItem(newItemPosition);
    // setEditing({ id: newItem.id, position: "caret_start" });
  });

  useActionListener('create_item_above', () => {
    const newItemPosition = getNewOrderingNumber(items, selectedIndex, selectedIndex - 1, "weekly");
    console.log("newItemPosition:", newItemPosition);
    createNewEditingItem(newItemPosition);
    // setEditing({ id: newItem.id, position: "caret_start" });
  });

  useActionListener('toggle_item_type', () => {
    if (selectedItem) {
      const type = (selectedItem.type === 'todo') ? 'note' : 'todo';
      updateItem({ ...selectedItem, type: type });
    }
  });

  useActionListener('insert', () => {
    if (!selectedItem) return;
    console.log("editing id:", selectedId);
    createExistingEditingItem(selectedItem);
  });

  useActionListener('append', () => {
    if (!selectedItem) return;
    console.log("editing id:", selectedId);
    createExistingEditingItem(selectedItem);
  });

  useActionListener('change', () => {
    if (!selectedItem) return;
    console.log("editing id:", selectedId);
    createExistingEditingItem(selectedItem);
  });

  useActionListener('insert_at_begining', () => {
    if (!selectedItem) return;
    console.log("editing id:", selectedId);
    createExistingEditingItem(selectedItem);
  });

  useActionListener('cancel', () => {
    if (existingEdit) {
      cancelEditingItem(existingEdit);
    } else if (newEdit) {
      cancelEditingItem(newEdit);
    } else if (selectedIndex !== null) {
      setSelectedId(null);
    } else {
    }
  });

  useActionListener('move-up', () => {
    if (!selectedItem) return;
    const newOrder = getNewOrderingNumber(items, selectedIndex - 1, selectedIndex - 2, "weekly")
    updateItem({
      ...selectedItem,
      order: { ...selectedItem.order, weekly: newOrder }
    });
  });
  useActionListener('move-down', () => {
    if (!selectedItem) return;
    const newOrder = getNewOrderingNumber(items, selectedIndex + 1, selectedIndex + 2, "weekly")
    updateItem({
      ...selectedItem,
      order: { ...selectedItem.order, weekly: newOrder }
    });
  });

  // move selected item to next section
  useActionListener('move-right', () => {
    if (!selectedItem) return;
    moveItemToSectionRelative(selectedItem, 1);
    gotoSectionRelative(1);
  });

  // move selected item to previous section
  useActionListener('move-left', () => {
    if (!selectedItem) return;
    moveItemToSectionRelative(selectedItem, -1);
    gotoSectionRelative(-1);
  });

  async function handleOnItemActionCallback(action: string, item: ItemType) {
    console.log("handleOnItemActionCallback:", action, item);
    if (action === "Edit") { if (existingEdit === null) createExistingEditingItem(item); }
    if (action === "Copy") { /* todo: copy */ }
    if (action === "Paste") {/* todo: paste */ }
    if (action === "Delete") { deleteItem(item).then(() => console.log("Delete done.")).catch((e) => console.log("Delete error,", e)); }
    if (action === "Update") { updateItem(item).then(() => console.log("Update done.")).catch((e) => console.log("Update error,", e)); }
    if (action === "Apply") { applyEditingItem(item).then((id) => { setSelectedId(id) }) }
    if (action === "Cancel") { cancelEditingItem(item); }
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl items-center gap-2">
      {allItems.map((item) => {
        const editing = (newEdit?.id === item.id) || (existingEdit?.id === item.id);
        const selected = (!newEdit && !existingEdit && (selectedId === item.id));
        return (
          <Item
            key={('id' in item) ? item.id : "new-item"}
            item={item}
            editing={editing}
            selected={selected}
            onItemActionCallback={handleOnItemActionCallback}
          />
        );
      })}
      {newEdit === null && existingEdit === null &&
        <Button variant="outline"
          onClick={() => {
            const newItemPosition = getNewOrderingNumber(items, itemsLength, itemsLength + 1, "weekly");
            console.log("newItemPosition:", newItemPosition);
            createNewEditingItem(newItemPosition);
          }}
        >
          <CirclePlus />New Item
        </Button>
      }
    </div>
  );
}
