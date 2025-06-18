import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { ItemType } from "@/types/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { db } from "@/lib/db";
import { useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, Circle, CircleCheckBig, CircleCheck, CircleX } from "lucide-react";


export function Item({ className, item, onItemAction, ...props }: { item: ItemType, onItemAction?: (action: string, item: ItemType) => void } & React.ComponentProps<"div">) {
  const [editing, setEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(item.title);

  const menus: Array<any> = [
    {
      name: "Edit", variant: "default", do: () => {
        console.log("editing id:", item.id);
        setEditing(true);
        setLocalTitle(item.title);
      }
    },
    {
      name: "Copy", variant: "default", do: () => {
        console.log("copying id:", item.id);
      }
    },
    {
      name: "Paste", variant: "default", do: () => {
        console.log("pasting stuff.");
      }
    },
    {
      name: "Delete", variant: "destructive", do: () => {
        console.log("deleting id:", item.id);
        db.items.delete(item.id).then(() => { console.log("done") }).catch(() => { console.log("failed") });
      }
    },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn("flex flex-row items-streach w-full gap-2", className)}
          {...props}
        >
          <Button variant="ghost" className="pt-2 text-primary/40"
            onClick={() => {
              let newItem = item;
              newItem.status = item.status === 'done' ? 'undone' : 'done';
              db.items.update(item.id, newItem);
            }}>
            {item.status === 'done' ? <CircleCheckBig /> : <Circle />}
          </Button>
          <Textarea
            rows={1}
            wrap="soft"
            value={editing && localTitle || item.title}
            className={cn("resize-none h-auto min-h-1 w-full bg-input/30 transition-all duration-200 border-none",
              `${editing ? "ring-ring/30 ring-3 focus-visible:ring-ring/50" : "focus-visible:ring-0 ring-0"}`)}
            readOnly={!editing}
            onChange={(ev) => setLocalTitle(ev.target.value)}
          />
          {editing && <Button
            className="mt-0.5" size="icon" variant="outline"
            onClick={() => {
              console.log("ok");
              let newItem = item;
              newItem.title = localTitle;
              db.items.update(item.id, newItem);
              setEditing(false);
            }}

          ><CheckIcon /></Button>}
          {editing && <Button
            className="mt-0.5" size="icon" variant="outline"
            onClick={() => { console.log("x"); setEditing(false); setLocalTitle(""); }}
          ><CircleX /></Button>}
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

