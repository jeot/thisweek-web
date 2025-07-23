/*
 * template
 *
[thisweek logo] ThisWeek
v0.7.0

"The story starts with you. It ends with you.
You take the steps that need to be taken.
Every time you fall, you rise again.
And with each new week, you begin again — stronger."

✅ Open source
✅ Weekly planning with todos and notes
✅ Works offline — data is stored in your browser
✅ Supports multiple calendars and locales
✅ Option to view a secondary calendar
☐ 🔄Sync across multiple devices
☐ 🧩Headings and nested todos/notes
- ☐ Group items under custom headings
- ☐ Add sub-items to individual todos/notes
☐ 🗂️Project-based organization
☐ 🎯Yearly goals and objectives

📝 Notes
Your data stays on your device.
Built with React, TS, and love ❤️
Let me know what you think — feedback is welcome.

[🌐 Website][🐙 GitHub]
*/

import { createNewItem } from "@/lib/items";
import { ListOfItemsContainer } from "./ListOfItems";

const list: Array<{
  id: number;
  title: string;
  type: 'todo' | 'note';
  status: 'done' | 'undone' | 'pending' | 'blocked' | 'canceled';
}> = [
    { id: 1, type: 'todo', status: 'done', title: "Open source" },
    { id: 2, type: 'todo', status: 'done', title: "Weekly planning with todos ☑️ and notes 📝" },
    { id: 3, type: 'todo', status: 'done', title: "Works offline — data is stored in your browser" },
    { id: 4, type: 'todo', status: 'done', title: "Supports multiple calendars 🗓 and locales 🌐" },
    { id: 5, type: 'todo', status: 'done', title: "Option to view a secondary calendar" },
    { id: 6, type: 'todo', status: 'undone', title: "🔄 Sync across multiple devices" },
    {
      id: 7, type: 'todo', status: 'undone', title:
        `Headings and nested todos/notes
\t🟡 Group items under custom headings
\t🟡 Add sub-items to individual todos/notes`
    },
    { id: 8, type: 'todo', status: 'undone', title: "🗂️ Project-based organization" },
    { id: 9, type: 'todo', status: 'undone', title: "🎯 Yearly goals and objectives" },
    {
      id: 10, type: 'note', status: 'undone', title:
        `📝 Notes:
\t🔸Your data stays on your device.
\t🔸Built with React, TS, and love ❤️
\t🔸Feedback is always welcome.`
    },
  ];

function List({ className }: { className?: string }) {
  const items = list.map((i) => {
    let item = createNewItem();
    item = { ...item, category: "project", ...i }
    return item;
  });
  console.log(items);
  return <ListOfItemsContainer className={className} items={items} />
}

export function SettingsAbout() {
  return (
    <div className="mt-2">
      {/*todo: <span>[thisweek logo]</span>*/}
      <h1>This<span className="font-normal mt-2">Week</span> <span className="font-normal text-base">App</span></h1>
      <span className="text-sm font-semibold">v{__APP_VERSION__}</span>

      <blockquote className="mt-6 border-l-2 pl-6 md:w-md italic text-sm">
        &quot;The story starts with you. It ends with you.
        You take the steps that need to be taken.
        Every time you fall, you rise again.
        And with each new week, you begin again.&quot;
        <br />
        <span className="text-sm text-primary/30">— Shamim Keshani</span>
      </blockquote>

      <List className="mt-6 md:w-md" />

      <p className="mt-6 text-center text-sm"><a target="_blank" href="https://app.planthisweek.com/">[Website]</a>&nbsp;<a target="_blank" href="https://github.com/jeot/thisweek-web">[GitHub]</a></p>
    </div>
  );
}
