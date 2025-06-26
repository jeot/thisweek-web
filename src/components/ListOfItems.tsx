import { NewItemInput } from "./AddNewItem";
import { Item } from "@/components/Item"
import { useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { addNewItem, createDefaultNewItem, deleteItem, getNewOrderingNumber, moveItemToSectionRelative, updateItem } from "@/lib/items";
import { useActionListener } from "@/lib/useActionListener";
import { ItemType } from "@/types/types";
import { useAppState } from "@/store/appStore";
import { NewItemType } from "@/lib/items";

interface ListOfItemsProps {
  items: ItemType[];
}

export function ListOfItems({ items }: ListOfItemsProps) {
  const [newItemInputBox, setNewItemInputBox] = useState<NewItemType | null>(null);
  const gotoSectionRelative = useAppState((state) => state.gotoSectionRelative);

  const itemsWithInputBox: Array<NewItemType | ItemType> = [];
  itemsWithInputBox.push(...items);
  if (newItemInputBox) itemsWithInputBox.push(newItemInputBox);
  itemsWithInputBox.sort((a, b) => a?.order.weekly - b?.order.weekly);

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

  async function cancelNewItem() {
    setNewItemInputBox(null);
  }

  async function handleAddNewItem(item: NewItemType) {
    addNewItem(item).then((id) => {
      console.log("added new item: id", id);
      setSelectedId(id);
    }).catch((err) => {
      console.log("error adding item:", err);
    });
    setNewItemInputBox(null);
  }

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

  useActionListener('cancel', () => {
    if (newItemInputBox) {
      setNewItemInputBox(null);
    } else if (selectedIndex !== null) {
      setSelectedId(null);
    } else {
    }
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
    const newItemPosition = getNewOrderingNumber(items, itemsLength, itemsLength + 1, "weekly");
    // console.log("newItemPosition:", newItemPosition);
    let newItem = createDefaultNewItem();
    newItem.order.weekly = newItemPosition;
    setNewItemInputBox(newItem);
  });

  useActionListener('create_item_above', () => {
    const newItemPosition = getNewOrderingNumber(items, selectedIndex, selectedIndex - 1, "weekly");
    // console.log("newItemPosition:", newItemPosition);
    let newItem = createDefaultNewItem();
    newItem.order.weekly = newItemPosition;
    setNewItemInputBox(newItem);
  });

  useActionListener('toggle_item_type', () => {
    if (selectedItem) {
      const type = (selectedItem.type === 'todo') ? 'note' : 'todo';
      updateItem({ ...selectedItem, type: type });
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

  const changeNewItemType = () => {
    if (newItemInputBox === null) return;
    const type = (newItemInputBox.type === 'todo') ? 'note' : 'todo';
    setNewItemInputBox({ ...newItemInputBox, type: type });
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl items-center gap-2">
      {itemsWithInputBox.map((item) => {
        if ('id' in item)
          return (
            <Item key={item.id} item={item} selected={(newItemInputBox === null) && (selectedId === item.id)} />
          );
        else
          return (
            <NewItemInput key={`new-item`} itemInit={item} addNewItem={handleAddNewItem} cancelNewItem={cancelNewItem} onChangeItemType={changeNewItemType} />
          );
      })}
      {newItemInputBox === null &&
        <Button variant="outline"
          onClick={() => {
            const newItemPosition = getNewOrderingNumber(items, itemsLength, itemsLength + 1, "weekly");
            console.log("newItemPosition:", newItemPosition);
            let newItem = createDefaultNewItem();
            newItem.order.weekly = newItemPosition;
            setNewItemInputBox(newItem);
          }}
        >
          <CirclePlus />New Item
        </Button>
      }
    </div>
  );
}
