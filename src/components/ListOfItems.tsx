import { Item, ItemActionType } from "@/components/Item"
import { useEffect } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { ItemType } from "@/types/types";
import { useAppLogic } from "@/store/appLogic";
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
  const selectedId = useAppLogic((state) => state.selectedId);
  const wiggleId = useAppLogic((state) => state.wiggleId);
  const moveItemScheduleTimeByWeeks = useAppLogic((state) => state.moveItemScheduleTimeByWeeks);
  const moveItemScheduleTimeToThisWeek = useAppLogic((state) => state.moveItemScheduleTimeToThisWeek);
  const requestBeginEditingExistingItem = useAppLogic((state) => state.requestBeginEditingExistingItem);
  const requestBeginEditingNewItem = useAppLogic((state) => state.requestBeginEditingNewItem);
  const requestCopyItemAsync = useAppLogic((state) => state.requestCopyItemAsync);
  const requestPasteAtItemAsync = useAppLogic((state) => state.requestPasteAtItemAsync);
  const requestDeleteItem = useAppLogic((state) => state.requestDeleteItem);
  const requestUpdateItem = useAppLogic((state) => state.requestUpdateItem);
  const requestApplyEditingItem = useAppLogic((state) => state.requestApplyEditingItem);
  const requestCancelEditingItem = useAppLogic((state) => state.requestCancelEditingItem);
  const requestChangeSelectedItemById = useAppLogic((state) => state.requestChangeSelectedItemById);
  const requestMoveItemUpOrDown = useAppLogic((state) => state.requestMoveItemUpOrDown);
  const requestToggleItemType = useAppLogic((state) => state.requestToggleItemType);
  const editingCaretPosition = useAppLogic((state) => state.editingCaretPosition);

  let allItems: Array<ItemType> = [];
  allItems.push(...items);
  if (newEdit) {
    // console.log("newEdit:", newEdit);
    allItems.push(newEdit);
  }
  if (existingEdit) {
    // console.log("existingEdit:", existingEdit);
    allItems = allItems.map(item =>
      item.id === existingEdit?.id ? existingEdit : item
    );
  }
  allItems.sort((a, b) => a?.order.weekly - b?.order.weekly);

  const itemsLength = items.length || 0;
  const selectedIndex: number = items.findIndex((item) => (item.id === selectedId));

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < (itemsLength - 1)) {
      const itemRef = document.getElementById(`item-id-${selectedId}`);
      if (itemRef) scrollIntoViewIfNeeded(itemRef, "main-content-window");
    }
    if (selectedIndex >= 0 && selectedIndex == itemsLength - 1) {
      const itemRef = document.getElementById(`new-item-btn-id`);
      if (itemRef) scrollIntoViewIfNeeded(itemRef, "main-content-window");
    }
  }, [selectedIndex]);

  async function handleOnItemActionCallback(action: ItemActionType, item: ItemType) {
    const modifyingActions: Array<ItemActionType> = ["Edit", "Paste", "Delete", "Update", "Apply", "Move Up", "Move Down", "Move Next", "Move Previous", "Move Today"];
    if (!modifiable && (modifyingActions.indexOf(action) >= 0)) return;
    // console.log("handleOnItemActionCallback:", action, item);
    if (action === "None") { /* have a tea. */ }
    if (action === "Edit") { requestBeginEditingExistingItem(item); }
    if (action === "Copy") { requestCopyItemAsync(item); }
    if (action === "Paste") { requestPasteAtItemAsync(item); }
    if (action === "Delete") { requestDeleteItem(item); }
    if (action === "Update") { requestUpdateItem(item); }
    if (action === "Apply") { requestApplyEditingItem(item); }
    if (action === "Cancel") { requestCancelEditingItem(item); }
    if (action === "ContextMenuOpened") { requestChangeSelectedItemById(item.id); }
    if (action === "Move Up") { requestMoveItemUpOrDown(item, -1); }
    if (action === "Move Down") { requestMoveItemUpOrDown(item, +1); }
    if (action === "Move Next") { moveItemScheduleTimeByWeeks(item, +1) }
    if (action === "Move Previous") { moveItemScheduleTimeByWeeks(item, -1) }
    if (action === "Move Today") { moveItemScheduleTimeToThisWeek(item); }
    if (action === "Toggle Type") { requestToggleItemType(item); }
  }

  function handleOnItemClick(item: ItemType): void {
    if (!newEdit && !existingEdit) {
      if (selectedId === item.id) {
        requestChangeSelectedItemById(null);
      } else {
        requestChangeSelectedItemById(item.id);
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
            className={item.id === wiggleId ? "wiggle" : ""}
            id={`item-id-${item.id}`}
            item={displayItem}
            editing={editing}
            editingPosition={editing && editingCaretPosition || null}
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
          onClick={(event) => {
            event.stopPropagation();
            requestBeginEditingNewItem(itemsLength, itemsLength + 1);
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
    <div className={cn("flex flex-col min-w-64 w-full md:w-2xl items-center p-2 gap-2", className)}>
      {header && <h3 className="text-primary/30">{header}</h3>}
      <ListOfItems items={items} newEdit={newEdit} existingEdit={existingEdit} modifiable={modifiable} />
    </ div>
  );
}
