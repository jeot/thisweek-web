import { cn, getSmartTextDirection } from "@/lib/utils";
import { ItemType } from "@/types/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import { useTheme } from "next-themes";

export type ItemActionType = "None" | "Edit" | "Copy" | "Paste" | "Delete" | "Update" | "Apply" | "Cancel" | "ContextMenuOpened" | "Move Up" | "Move Down" | "Move Next" | "Move Previous" | "Move Today" | "Toggle Type";

type ContextMenuType = {
  name: string;
  separator?: boolean;
  subMenus?: Array<ContextMenuType>;
  variant?: "default" | "destructive";
  action: ItemActionType;
};

export function Item({ className, item, editing, editingPosition, selected, disableContextMenu, onItemActionCallback, ...props }:
  { item: ItemType, editing: boolean, editingPosition: any, selected?: boolean, disableContextMenu?: boolean, onItemActionCallback: (action: ItemActionType, item: ItemType) => void } & React.ComponentProps<"div">) {

  const contextMenus: Array<ContextMenuType> = [
    { name: "Edit", variant: "default", action: 'Edit' },
    { name: "Copy", variant: "default", action: 'Copy' },
    { name: "Paste", variant: "default", action: 'Paste' },
    { name: "Change Type", variant: "default", action: 'Toggle Type' },
    {
      name: "Move Item", action: 'None', subMenus: [
        { name: "Move Up", variant: "default", action: 'Move Up' },
        { name: "Move Down", variant: "default", action: 'Move Down' },
        { name: "Send to Next Week", variant: "default", action: 'Move Next' },
        { name: "Send to Previous Week", variant: "default", action: 'Move Previous' },
        { name: "Send to This Week", variant: "default", action: 'Move Today' },
      ]
    },
    { name: "Seperator", separator: true, action: 'None' },
    { name: "Delete", variant: "destructive", action: 'Delete' },
  ];

  const [title, setTitle] = useState<string>(item.title);
  const displayTitle = editing ? title : item.title;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editing) {
        onItemActionCallback('Update', { ...item, title: title });
      }
    }, 500); // 0.5 second delay

    return () => clearTimeout(timeout); // reset timer on each change
  }, [title, editing]);

  const { theme } = useTheme();
  const checkedColor = theme === 'dark' ? "#00aa00" : "#20aa20";
  const plainColor = theme === 'dark' ? "#333333" : "#dddddd";

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // form: https://heroicons.com/outline
  const CircleCheckFilled = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={checkedColor} className="size-6">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
  const CircleCheckEmpty = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={plainColor} className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12 a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
  const NoteIconFilled = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={plainColor} className="size-6">
    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
  </svg>

  function recursiveContextMenus(menu: ContextMenuType) {
    if (menu.separator) {
      return <ContextMenuSeparator key={`separator-${menu.name}`} />;
    } else if (menu.subMenus) {
      return <ContextMenuSub key={`submenu-${menu.name}`}>
        <ContextMenuSubTrigger key={`subtriger-${menu.name}`}>{menu.name}</ContextMenuSubTrigger>
        <ContextMenuSubContent key={`subcontent-${menu.name}`}>
          {menu.subMenus.map((sub) => { return recursiveContextMenus(sub); })}
        </ContextMenuSubContent>
      </ContextMenuSub>;
    } else {
      return <ContextMenuItem key={menu.name} variant={menu.variant} onSelect={() => onItemActionCallback(menu.action, item)}>{menu.name}</ContextMenuItem>;
    }
  }

  useEffect(() => {
    if (editing) setTitle(item.title);
    const el = textareaRef.current;
    if (editing && el) {
      requestAnimationFrame(() => {
        el.focus();
        if (editing && editingPosition === 'caret_start') el.setSelectionRange(0, 0); // Move caret to start
        else if (editing && editingPosition === 'caret_end') el.setSelectionRange(el.value.length, el.value.length); // Move caret to end
        else if (editing && editingPosition === 'caret_select_all') el.setSelectionRange(0, el.value.length); // Select all
        else el.setSelectionRange(0, 0);
      });
    }
    if (!editing && el) el.setSelectionRange(0, 0);
  }, [editing]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event: React.KeyboardEvent) => {
    if (!editing) return;
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
            "hover:shadow-xs hover:bg-input/50 hover:dark:bg-input/30",
            `${selected && !editing ? "ring-1 ring-indigo-500" : ""}`,
            className
          )}
          {...props}
        >
          {item.type === 'todo' &&
            <Button variant="noHover" className="mt-[0.2rem]" size="shk"
              onClick={(event) => {
                event.stopPropagation();
                const newStatus = item.status === 'done' ? 'undone' : 'done';
                const completedAt = newStatus === 'done' ? (new Date()).getTime() : null;
                onItemActionCallback('Update', { ...item, title: displayTitle, status: newStatus, completedAt: completedAt });
              }}>
              {item.status === 'done' ? <CircleCheckFilled /> : <CircleCheckEmpty />}
            </Button>}
          {item.type === 'note' &&
            <Button variant="noHover" className="mt-[0.2rem]" size="shk"
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
              "shadow-none dark:shadow-none bg-transparent dark:bg-transparent",
              // "hover:shadow-xs hover:bg-input/50 hover:dark:bg-input/30",
              "transition-all duration-200",
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
      </ContextMenuTrigger >
      <ContextMenuContent>
        {contextMenus.map((menu) => recursiveContextMenus(menu))}
      </ContextMenuContent>
    </ContextMenu >
  )
}
