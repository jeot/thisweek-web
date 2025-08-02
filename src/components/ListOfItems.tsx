import { Item, ItemActionType } from "@/components/Item"
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { saveAsNewItem, applyEditingItem, cancelEditingItem, createExistingEditingItem, createNewEditingItem, createNewItem, deleteItem, getNewOrderingNumber, moveItemToSectionRelative, updateItem } from "@/lib/items";
import { useActionListener } from "@/lib/useActionListener";
import { ItemType } from "@/types/types";
import { useCalendarState } from "@/store/calendarStore";
import { useAppState } from "@/store/appStore";
import { useWeekState } from "@/store/weekStore";
import { cn } from "@/lib/utils";

function scrollIntoViewIfNeeded(target: HTMLElement, parentID: string): void {
  // console.log("scroll into view... ", target, parentID);
  const itemTop = target.getBoundingClientRect().top;
  const itemBot = target.getBoundingClientRect().bottom;
  // console.log("top/bot:", itemTop, itemBot);
  // console.log("window inner height", window.innerHeight);
  // console.log("window inner width", window.innerWidth);
  // console.log("doc height", document.documentElement.clientHeight);
  // console.log("doc width", document.documentElement.clientWidth);
  // Target is outside the viewport from the bottom
  const itemsBoxTop = document.getElementById(parentID)?.getBoundingClientRect().top ?? 0;
  const itemsBoxBot = document.getElementById(parentID)?.getBoundingClientRect().bottom ?? 0;
  // console.log(itemsBoxTop, itemsBoxBot);
  if (itemBot > itemsBoxBot) {
    //  The bottom of the target will be aligned to the bottom of the visible area of the scrollable ancestor.
    // target.scrollIntoView(false);
    // console.log("scrollIntoView bottom");
    target.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }

  // Target is outside the view from the top
  if (itemTop < itemsBoxTop) {
    // The top of the target will be aligned to the top of the visible area of the scrollable ancestor
    // target.scrollIntoView();
    // console.log("scrollIntoView top");
    target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }
};

interface ListOfItemsProps {
  className?: string;
  items: ItemType[];
  newEdit?: ItemType | null;
  existingEdit?: ItemType | null;
  modifiable?: boolean;
}

export function ListOfItems({ className, items, newEdit, existingEdit, modifiable }: ListOfItemsProps) {
  const gotoSectionRelative = useAppState((state) => state.gotoSectionRelative);
  const internalCopiedItem = useAppState((state) => state.internalCopiedItem);
  const setInternalCopiedItem = useAppState((state) => state.setInternalCopiedItem);
  const weekReference = useWeekState((state) => state.weekReference);
  const mainCal = useCalendarState((state) => state.mainCal);

  const [editingPosition, setEditingPosition] = useState<'caret_start' | 'caret_end' | 'caret_select_all' | null>(null);

  const defaultLocaleDirection = (mainCal.locale.direction === 'ltr');

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
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < (itemsLength - 1)) {
      const itemRef = document.getElementById(`item-id-${selectedId}`);
      if (itemRef) scrollIntoViewIfNeeded(itemRef, "main-content-window");
    }
    if (selectedIndex >= 0 && selectedIndex == itemsLength - 1) {
      const itemRef = document.getElementById(`new-item-btn-id`);
      if (itemRef) scrollIntoViewIfNeeded(itemRef, "main-content-window");
    }
  }, [selectedId]);
  // const [editing, setEditing] = useState<{ id: number, position: 'caret_start' | 'caret_end' | 'select_all' } | null>(null);

  async function handlePasteAtIndex(index: number) {
    if (!modifiable) return;
    try {
      console.log("trying to get the text from clipboard...");
      const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      console.log("permission: ", result.state); // 'granted', 'denied', or 'prompt'

      let text = await navigator.clipboard.readText();
      console.log("pasting text: ", text);
      if (text.trim().length == 0) {
        console.log("no text value for paste available. ignored");
        return
      }

      /*
       * the test for debugging the issue with copy/paste!
       * windows replaces the \n with \r\n
       * that's why we use the normalize function bellow
       */
      // console.log("text from os clipboard:", text);
      // console.log("text from internal ref:", smartClipboardItemRef.current?.text);
      // console.log("text from os clipboard:", JSON.stringify(text));
      // console.log("text from internal ref:", JSON.stringify(smartClipboardItemRef.current?.text));
      // console.log("length text from os clipboard:", text.length);
      // console.log("length text from internal ref:", smartClipboardItemRef.current?.text.length);
      // console.log("os clipboard split by line:", text.split(''));
      // console.log("internal ref split by line:", smartClipboardItemRef.current.text.split(''));
      // const hash = s => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
      // console.log("Clipboard hash:", hash(text));
      // console.log("Internal hash:", hash(smartClipboardItemRef.current.text));

      const normalize = (str: string) => str.replace(/\r\n/g, '\n');
      const internalCopy = (internalCopiedItem && (normalize(text) === normalize(internalCopiedItem.title))) || false;

      const newItemPosition = getNewOrderingNumber(items, index, index + 1, "weekly")
      if (internalCopy && internalCopiedItem) {
        let newItem = internalCopiedItem;
        newItem.order["weekly"] = newItemPosition;
        newItem.scheduledAt = weekReference;
        newItem.deletedAt = null;
        saveAsNewItem(newItem).then((id) => { setSelectedId(id) })
      } else if (!internalCopy) {
        let newItem = createNewItem(newItemPosition);
        newItem.title = text;
        saveAsNewItem(newItem).then((id) => { setSelectedId(id) })
      } else {
      }
    } catch (err) {
      const log = `Error: trying to paste: ${err}`;
      console.log(log);
    }
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

  useActionListener('delete', () => {
    if (!modifiable || !selectedItem) return
    deleteItem(selectedItem);
  });

  useActionListener('copy', () => {
    if (!selectedItem) return
    setInternalCopiedItem(selectedItem);
  });

  useActionListener('copy_all_items_text', () => {
    // todo: copy all the items in the list as a single text to clipboard
    console.log("todo! not implemented yet!");
  });

  useActionListener('paste', () => {
    if (!modifiable) return;
    if (selectedIndex >= 0) handlePasteAtIndex(selectedIndex);
    else handlePasteAtIndex(itemsLength);
  });

  useActionListener('paste_above', () => {
    handlePasteAtIndex(selectedIndex - 1);
  });

  useActionListener('toggle_status', () => {
    if (!modifiable || !selectedItem) return;
    const newStatus = selectedItem.status === 'done' ? 'undone' : 'done';
    updateItem({ ...selectedItem, status: newStatus });
  });

  useActionListener('create', () => {
    if (!modifiable) return;
    const newItemPosition = selectedIndexNotValid ?
      getNewOrderingNumber(items, itemsLength, itemsLength + 1, "weekly") :
      getNewOrderingNumber(items, selectedIndex, selectedIndex + 1, "weekly");
    console.log("newItemPosition:", newItemPosition);
    createNewEditingItem(newItemPosition);
    // setEditing({ id: newItem.id, position: "caret_start" });
  });

  useActionListener('create_above', () => {
    if (!modifiable) return;
    const newItemPosition = getNewOrderingNumber(items, selectedIndex, selectedIndex - 1, "weekly");
    console.log("newItemPosition:", newItemPosition);
    createNewEditingItem(newItemPosition);
    // setEditing({ id: newItem.id, position: "caret_start" });
  });

  function toggleItemType(item: ItemType | null) {
    if (!modifiable || !item) return;
    const type = (item.type === 'todo') ? 'note' : 'todo';
    updateItem({ ...item, type: type });
  }

  useActionListener('toggle_type', () => {
    toggleItemType(selectedItem);
  });

  // todo: fix the editing location
  useActionListener('edit_start', () => {
    if (!modifiable || !selectedItem) return;
    console.log("editing id:", selectedId);
    setEditingPosition('caret_start');
    createExistingEditingItem(selectedItem);
  });

  useActionListener('edit_end', () => {
    if (!modifiable || !selectedItem) return;
    console.log("editing id:", selectedId);
    setEditingPosition('caret_end');
    createExistingEditingItem(selectedItem);
  });

  useActionListener('edit_select_all', () => {
    if (!modifiable || !selectedItem) return;
    console.log("editing id:", selectedId);
    setEditingPosition('caret_select_all');
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

  function move(direction: 'updown' | 'leftright', offset: number) {
    if (!modifiable || !selectedItem) return;
    console.log("moving...", direction, offset, selectedItem);
    if (direction === 'updown') {
      console.log("updown...");
      const nextOffset = offset >= 0 ? offset + 1 : offset - 1;
      const newOrder = getNewOrderingNumber(items, selectedIndex + offset, selectedIndex + nextOffset, "weekly")
      updateItem({
        ...selectedItem,
        order: { ...selectedItem.order, weekly: newOrder }
      });
    }
    if (direction === 'leftright') {
      console.log("leftright...");
      moveItemToSectionRelative(selectedItem, offset);
      gotoSectionRelative(offset);
    }
  }

  // move selected item (or right-clicked)
  useActionListener('move-up', () => {
    move('updown', -1);
  });
  useActionListener('move-down', () => {
    move('updown', 1);
  });
  useActionListener('move-right', () => {
    if (defaultLocaleDirection) move('leftright', 1);
    else move('leftright', -1);
  });
  useActionListener('move-left', () => {
    if (defaultLocaleDirection) move('leftright', -1);
    else move('leftright', 1);
  });

  async function handleOnItemActionCallback(action: ItemActionType, item: ItemType) {
    const modifyingActions: Array<ItemActionType> = ["Edit", "Paste", "Delete", "Update", "Apply", "Move Up", "Move Down", "Move Next", "Move Previous"];
    if (!modifiable && (modifyingActions.indexOf(action) >= 0)) return;
    // console.log("handleOnItemActionCallback:", action, item);
    if (action === "None") { /* have a tea. */ }
    if (action === "Edit") { if (!existingEdit) createExistingEditingItem(item); }
    if (action === "Copy") { if (!existingEdit && !newEdit) setInternalCopiedItem(item); }
    if (action === "Paste") {
      if (selectedIndex >= 0) handlePasteAtIndex(selectedIndex);
      else handlePasteAtIndex(itemsLength);
    }
    if (action === "Delete") { deleteItem(item).then(() => console.log("Delete done.")).catch((e) => console.log("Delete error,", e)); }
    if (action === "Update") { updateItem(item).then(() => console.log("Update done.")).catch((e) => console.log("Update error,", e)); }
    if (action === "Apply") { applyEditingItem(item).then((id) => { setSelectedId(id) }).catch((e) => console.log("Apply error,", e)); }
    if (action === "Cancel") { cancelEditingItem(item); }
    if (action === "ContextMenuOpened") { if (!existingEdit && !newEdit) setSelectedId(item.id); }
    if (action === "Move Up") { move('updown', -1); }
    if (action === "Move Down") { move('updown', 1); }
    if (action === "Move Next") { move('leftright', 1); }
    if (action === "Move Previous") { move('leftright', -1); }
    if (action === "Toggle Type") {
      toggleItemType(item);
    }
  }

  function handleOnItemClick(item: ItemType): void {
    if (!newEdit && !existingEdit) {
      if (selectedId === item.id) {
        setSelectedId(null);
      } else {
        setSelectedId(item.id);
      }
    }
  }

  return (
    <div className={cn("flex flex-col flex-1 w-full items-center gap-0", className)}>
      {allItems.map((item) => {
        const displayItem = ((newEdit?.id === item.id) && newEdit) || ((existingEdit?.id === item.id) && existingEdit) || item;
        const editing = modifiable ? ((newEdit?.id === item.id) || (existingEdit?.id === item.id)) : false;
        const selected = (!newEdit && !existingEdit && (selectedId === item.id));
        return (
          <Item
            key={item.id}
            id={`item-id-${item.id}`}
            item={displayItem}
            editing={editing}
            editingPosition={editing && editingPosition || null}
            selected={selected}
            disableContextMenu={editing}
            onItemActionCallback={handleOnItemActionCallback}
            onClick={(event) => { event.stopPropagation(); handleOnItemClick(item); }}
          />
        );
      })}
      {modifiable && !newEdit && !existingEdit &&
        <Button variant="outline"
          className="mt-2"
          id="new-item-btn-id"
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

export function ListOfItemsContainer({ className, items, newEdit, existingEdit, modifiable, header }: { header?: string } & ListOfItemsProps) {
  return (
    <div className={cn("flex flex-col min-w-64 w-full md:w-xl items-center p-2 gap-2", className)}>
      {header && <h3 className="text-primary/30">{header}</h3>}
      <ListOfItems items={items} newEdit={newEdit} existingEdit={existingEdit} modifiable={modifiable} />
    </ div>
  );
}

