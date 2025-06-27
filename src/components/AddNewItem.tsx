import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Circle, NotebookText } from "lucide-react";
import { NewItemType } from "@/lib/items";

export function NewItemInput({ itemInit, addNewItem, cancelNewItem }:
  { itemInit: NewItemType, addNewItem: (item: NewItemType) => void, cancelNewItem: () => void }) {
  const [item, setItem] = useState(itemInit);

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
    if ((enter && !shift) && item.title.trim() === "") {
      event.preventDefault();
      cancelNewItem();
    } else if (enter && !shift) {
      event.preventDefault();
      addNewItem(item);
    } else if (escape) {
      event.stopPropagation();
      event.preventDefault();
      cancelNewItem();
    } else if (event.key === 'x' && event.ctrlKey) {
      const type = (item.type === 'todo') ? 'note' : 'todo';
      setItem({ ...item, type: type });
    } else { }
  }

  return (
    <div className="flex w-full gap-2 items-center">
      <Button variant="ghost" className="pt-2 text-primary/40">
        {item.type === 'todo' && <Circle />}
        {item.type === 'note' && <NotebookText />}
      </Button>
      <Textarea
        autoFocus
        value={item.title}
        wrap="soft"
        className="resize-none h-auto min-h-1 w-full max-w-xl"
        onChange={(ev) => setItem({ ...item, title: ev.target.value })}
        onKeyDown={handleKeyDown}
        placeholder="The most important thing todo..."
      />
      <Button variant="default"
        onClick={() => {
          addNewItem(item);
        }}
        size="sm">Add</Button>
      <Button variant="secondary" onClick={() => cancelNewItem()} size="sm">Cancel</Button>
    </div >
  );
}
