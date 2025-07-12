import { cn, getSmartTextDirection } from "@/lib/utils";
import { ItemType } from "@/types/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import { useTheme } from "next-themes";

export type ItemActionType = "Edit" | "Copy" | "Paste" | "Delete" | "Update" | "Apply" | "Cancel" | "ContextMenuOpened";

export function Item({ className, item, editing, selected, disableContextMenu, onItemActionCallback, ...props }:
  { item: ItemType, editing: boolean, selected?: boolean, disableContextMenu?: boolean, onItemActionCallback: (action: ItemActionType, item: ItemType) => void } & React.ComponentProps<"div">) {

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
  // form: https://heroicons.com/outline
  const CircleCheckFilled = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={checkedColor} className="size-6">
    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
  </svg>
  const CircleCheckEmpty = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke={plainColor} className="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12 a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
  const NoteIconFilled = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={plainColor} className="size-6">
    <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
  </svg>



  const { theme } = useTheme();
  const checkedColor = theme === 'dark' ? "#00aa00" : "#20aa20";
  const plainColor = theme === 'dark' ? "#333333" : "#bbbbbb";

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
      <ContextMenuTrigger asChild disabled={disableContextMenu}
        onContextMenu={(event) => {
          event.stopPropagation();
          onItemActionCallback('ContextMenuOpened', item);
        }}
      >
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
            <Button variant="ghost" className="mt-[0.2rem]" size="shk"
              onClick={(event) => {
                event.stopPropagation();
                const newStatus = item.status === 'done' ? 'undone' : 'done';
                const completedAt = newStatus === 'done' ? (new Date()).getTime() : null;
                onItemActionCallback('Update', { ...item, title: displayTitle, status: newStatus, completedAt: completedAt });
              }}>
              {item.status === 'done' ? <CircleCheckFilled /> : <CircleCheckEmpty />}
            </Button>}
          {item.type === 'note' &&
            <Button variant="ghost" className="mt-[0.2rem]" size="shk"
              onClick={(event) => {
                event.stopPropagation();
              }}>
              <NoteIconFilled />
            </Button>}

          <TextareaAutosize
            // autoFocus
            ref={textareaRef}
            wrap="soft"
            dir={getSmartTextDirection(displayTitle)}
            value={displayTitle}
            className={cn(
              "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-2 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
              "leading-relaxed resize-none h-auto min-h-1 flex-1 border-none overflow-hidden",
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
            className="m-0.5 ms-1" size="shk" variant="outline"
            onClick={(event) => {
              event.stopPropagation()
              onItemActionCallback('Apply', { ...item, title: displayTitle });
            }}
          ><CheckIcon /></Button>}
          {editing && <Button
            className="m-0.5" size="shk" variant="outline"
            onClick={(event) => {
              event.stopPropagation()
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
