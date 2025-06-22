import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ItemType } from "@/types/types";

export function NewItemInput({ addNewItem, cancelNewItem }:
  { addNewItem: (newItem: ItemType) => void, cancelNewItem: () => void }
) {
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
        status: 'undone',
      });
    } else if (escape) {
      event.stopPropagation();
      event.preventDefault();
      cancelNewItem();
    } else { }
  }

  return (
    <div className="flex w-full gap-2 items-center">
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
            status: 'undone',
          });
        }}
        size="sm">Add</Button>
      <Button variant="secondary" onClick={() => cancelNewItem()} size="sm">Cancel</Button>
    </div >
  );
}
