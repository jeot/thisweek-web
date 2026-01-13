/*
 * template
 *
[thisweek logo] ThisWeek
v0.7.0

"The story starts with you. It ends with you.
You take the steps that need to be taken.
Every time you fall, you rise again.
And with each new week, you begin again"

✅ Open source
✅ Weekly planning with todos and notes
✅ Works offline — data is stored in your browser
✅ Multiple calendars and locales 🌐
✅ Display secondary calendar dates
[ ] Sync across multiple devices 📱 🔄 💻
[ ] Nested todos/notes
  🟡 Add sub-items to individual todos/notes
  🟡 Group items under custom headings
[ ] 🗂️ Lists and Project-like organization
[ ] 🎯 Yearly goals and objectives

Notes 📝
Your data stays on your device.
Built with React, TS, and love ❤️
Feedback is always welcome.

[🌐 Website]
"https://thisweek.me/"
[🐙 GitHub]
"https://github.com/jeot/thisweek-web"
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
    { id: 4, type: 'todo', status: 'done', title: "Multiple calendars and locales 🌐" },
    { id: 5, type: 'todo', status: 'done', title: "Display secondary calendar dates" },
    { id: 6, type: 'todo', status: 'undone', title: "Sync across multiple devices 📱 🔄 💻" },
    {
      id: 7, type: 'todo', status: 'undone', title:
        `Nested todos/notes
\t🟡 Add sub-items to individual todos/notes
\t🟡 Group items under custom headings`
    },
    { id: 8, type: 'todo', status: 'undone', title: "🗂️ Lists and Project-like organization" },
    { id: 9, type: 'todo', status: 'undone', title: "🎯 Yearly goals and objectives" },
    {
      id: 10, type: 'note', status: 'undone', title:
        `Notes 📝
Your data stays on your device.
Built with React, TS, and love ❤️
Feedback is always welcome.`
    },
  ];

function List({ className }: { className?: string }) {
  const items = list.map((i) => {
    let item = createNewItem('project');
    item = { ...item, category: "project", ...i }
    return item;
  });
  return <ListOfItemsContainer className={className} items={items} category='project' header="What is ThisWeek App?" />
}

export function SettingsAbout() {
  return (
    <div className="">
      {/*todo: <span>[thisweek logo]</span>*/}
      <h2 className="mt-2">This<span className="font-normal">Week</span> <span className="font-normal text-base">App</span></h2>
      <span className="text-xs font-semibold">&nbsp;v{__APP_VERSION__}</span>

      <blockquote className="mt-6 border-l-2 pl-6 md:w-md italic text-sm">
        &quot;The story starts with you. It ends with you.
        You take the steps that need to be taken.
        Every time you fall, you rise again.
        And with each new week, you begin again.&quot;
        <br />
        <span className="text-sm text-primary/30">— Shamim Keshani</span>
      </blockquote>

      <List className="mt-6 md:w-md" />

      <p className="mt-6 text-center text-sm"><a target="_blank" href="https://thisweek.me/">[Website]</a>&nbsp;<a target="_blank" href="https://github.com/jeot/thisweek-web">[GitHub]</a></p>
    </div>
  );
}
