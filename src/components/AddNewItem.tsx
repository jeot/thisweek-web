import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ItemType } from "@/types/types";
import { Circle, NotebookText } from "lucide-react";

export function NewItemInput({ itemType, addNewItem, cancelNewItem, onChangeItemType }:
  { itemType: 'todo' | 'note', addNewItem: (newItem: ItemType) => void, cancelNewItem: () => void, onChangeItemType: () => void }) {
  const [title, setTitle] = useState('');

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event: React.KeyboardEvent) => {
    // ignore Enter with other mod-keys
    if (event.key === 'Enter' && (event.ctrlKey || event.altKey || event.metaKey)) {
      event.preventDefault();
      return;
    }
    let escape = false;
    let enter = false;
    let shift = false;
    if (event.key === 'Escape') escape = true;
    if (event.key === 'Enter') enter = true;
    if (event.shiftKey) shift = true;
    if ((enter && !shift) && title.trim() === "") {
      event.preventDefault();
      cancelNewItem();
    } else if (enter && !shift) {
      event.preventDefault();
      addNewItem({
        id: 0,
        title: title,
        type: itemType,
        status: 'undone',
      });
    } else if (escape) {
      event.stopPropagation();
      event.preventDefault();
      cancelNewItem();
    } else if (event.key === 'x' && event.ctrlKey) {
      onChangeItemType();
    } else { }
  }

  return (
    <div className="flex w-full gap-2 items-center">
      <Button variant="ghost" className="pt-2 text-primary/40">
        {itemType === 'todo' && <Circle />}
        {itemType === 'note' && <NotebookText />}
      </Button>
      <Textarea
        autoFocus
        value={title}
        wrap="soft"
        className="resize-none h-auto min-h-1 w-full max-w-xl"
        onChange={(ev) => setTitle(ev.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="The most important thing todo..."
      />
      <Button variant="default"
        onClick={() => {
          addNewItem({
            id: 0,
            title: title,
            type: itemType,
            status: 'undone',
          });
        }}
        size="sm">Add</Button>
      <Button variant="secondary" onClick={() => cancelNewItem()} size="sm">Cancel</Button>
    </div >
  );
}
