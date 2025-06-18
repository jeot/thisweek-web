import { db } from "@/lib/db";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function NewItemInput() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('undone');

  async function addItem() {
    try {
      // Add the new friend!
      const id = await db.items.add({
        title,
        status,
      });

      const msg = `Item successfully added. Got id ${id}`;
      setTitle('');
      setStatus('undone');
      console.log(msg);
    } catch (error) {
    }
  }

  return (
    <div>
      <div className="flex w-full gap-2">
        <Textarea
          value={title}
          rows={1}
          name="textarea"
          wrap="soft"
          className="resize-none h-auto min-h-1 w-full max-w-xl"
          onChange={(ev) => setTitle(ev.target.value)}
          placeholder="The most important thing todo..."
        />
        <Button onClick={addItem}>Add</Button>
      </div>
    </div>
  );
}
