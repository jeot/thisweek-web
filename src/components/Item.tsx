import { cn, getSmartTextDirection } from "@/lib/utils";
import { ItemType } from "@/types/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, Circle, CircleCheckBig, NotebookText, XIcon } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';


export function Item({ className, item, editing, selected, onItemActionCallback, ...props }: { item: ItemType, editing: boolean, selected?: boolean, onItemActionCallback: (action: string, item: ItemType) => void } & React.ComponentProps<"div">) {

  const menus: Array<any> = [
    {
      name: "Edit", variant: "default", do: () => {
        onItemActionCallback('Edit', item);
      }
    },
    {
      name: "Copy", variant: "default", do: () => {
        onItemActionCallback('Copy', item);
      }
    },
    {
      name: "Paste", variant: "default", do: () => {
        onItemActionCallback('Paste', item);
      }
    },
    {
      name: "Delete", variant: "destructive", do: () => {
        onItemActionCallback('Delete', item);
      }
    },
  ];

  const [title, setTitle] = useState<string>(item.title);
  const displayTitle = editing ? title : item.title;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editing) {
        onItemActionCallback('Update', { ...item, title: title });
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeout); // reset timer on each change
  }, [title, editing]);


  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) setTitle(item.title);
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      requestAnimationFrame(() => {
        el.focus();
        if (editing) el.setSelectionRange(el.value.length, el.value.length);
        /*todo:
        if (editing === 'caret_start') el.setSelectionRange(0, 0); // Move caret to start
        if (editing === 'caret_end') el.setSelectionRange(el.value.length, el.value.length); // Move caret to end
        if (editing === 'select_all') el.setSelectionRange(0, el.value.length); // Select all
        if (editing === 'new_item') el.setSelectionRange(0, 0); // New item
        */
      });
    }
  }, [editing]);

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
      onItemActionCallback('Cancel', item);
    } else if (enter && !shift) {
      event.preventDefault();
      onItemActionCallback('Apply', { ...item, title: title });
    } else if (escape) {
      event.stopPropagation();
      event.preventDefault();
      onItemActionCallback('Cancel', item);
    } else if (event.key === 'x' && event.ctrlKey) {
      const type = (item.type === 'todo') ? 'note' : 'todo';
      console.log("changing the item type to:", type);
      onItemActionCallback('Update', { ...item, title: title, type: type });
    } else { }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          dir={getSmartTextDirection(displayTitle)}
          className={cn(
            "relative rounded-md flex flex-row items-start w-full gap-0",
            `${selected && !editing ? "ring-1 ring-indigo-500" : ""}`,
            className
          )}
          {...props}
        >
          {item.type === 'todo' &&
            <Button variant="ghost" className="mt-[0.2rem] text-primary/60"
              onClick={() => {
                const newStatus = item.status === 'done' ? 'undone' : 'done';
                const completedAt = newStatus === 'done' ? (new Date()).getTime() : null;
                onItemActionCallback('Update', { ...item, title: displayTitle, status: newStatus, completedAt: completedAt });
              }}>
              {item.status === 'done' ? <CircleCheckBig /> : <Circle />}
            </Button>}
          {item.type === 'note' &&
            <Button variant="ghost" className="mt-[0.2rem] text-primary/40" >
              <NotebookText />
            </Button>}

          <TextareaAutosize
            // autoFocus
            ref={textareaRef}
            wrap="soft"
            dir={getSmartTextDirection(displayTitle)}
            value={displayTitle}
            className={cn(
              "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
              "leading-relaxed resize-none h-auto min-h-1 flex-1 border-none me-1 overflow-hidden",
              "shadow-none dark:shadow-none bg-transparent dark:bg-transparent hover:shadow-xs hover:bg-input/50 hover:dark:bg-input/30 transition-all duration-200",
              `${editing ? "ring-ring/30 ring-3 focus-visible:ring-ring/50" : "focus-visible:ring-0 ring-0"}`)}
            readOnly={!editing}
            onChange={(ev) => setTitle(ev.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/*
          <span className="absolute right-0 top-0 text-xs rounded-md p-1 border-1 border-red-600">{item.order.weekly}</span>
          */}
          {editing && <Button
            className="m-0.5" size="shk" variant="outline"
            onClick={() => { onItemActionCallback('Apply', { ...item, title: displayTitle }); }}
          ><CheckIcon /></Button>}
          {editing && <Button
            className="m-0.5" size="shk" variant="outline"
            onClick={() => {
              onItemActionCallback('Cancel', item);
            }}
          ><XIcon /></Button>}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {menus.map((value) =>
          <ContextMenuItem key={value.name} variant={value.variant} onSelect={() => { value.do() }}>{value.name}</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu >
  )
}
