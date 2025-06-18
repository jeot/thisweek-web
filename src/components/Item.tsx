import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { ItemType } from "@/types/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { db } from "@/lib/db";
import { useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, CircleX } from "lucide-react";


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
          className={cn("flex flex-row flex-1 w-full gap-1", className)}
          {...props}
        >
          <Textarea
            rows={1}
            wrap="soft"
            value={editing && localTitle || item.title}
            className={cn("resize-none h-auto min-h-1 w-full bg-input/30 transition-all duration-200",
              `${editing ? "border border-s-4 border-indigo-500 focus-visible:border-indigo-500" : "border-none focus-visible:ring-0 ring-0"}`)}
            readOnly={!editing}
            onChange={(ev) => setLocalTitle(ev.target.value)}
          />
          {editing && <Button
            className="" size="lg" variant="outline"
            onClick={() => {
              console.log("ok");
              let newItem = item;
              newItem.title = localTitle;
              db.items.update(item.id, newItem);
              setEditing(false);
            }}

          ><CheckIcon /></Button>}
          {editing && <Button
            className="" size="lg" variant="outline"
            onClick={() => { console.log("x"); setEditing(false); setLocalTitle(""); }}
          ><CircleX /></Button>}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {menus.map((value) =>
          <ContextMenuItem key={value.name} variant={value.variant} onSelect={() => { value.do() }}>{value.name}</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

