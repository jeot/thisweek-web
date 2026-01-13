import { ListOfItemsContainer } from '@/components/ListOfItems';
import { useAppLogic } from "@/store/appLogic";
import { Button } from './ui/button';
import { CirclePlus } from 'lucide-react';

export function ProjectsPage() {
  const requestProjectChange = useAppLogic((state) => state.requestProjectChange);
  const eventProjectPageClicked = useAppLogic((state) => state.eventProjectPageClicked);
  const items = useAppLogic((state) => state.projectItems);
  const projects = useAppLogic((state) => state.projects);
  const activeProjectUuid = useAppLogic((state) => state.activeProjectUuid);
  const editingNewItem = useAppLogic((state) => state.editingNewItem);
  const editingExistingItem = useAppLogic((state) => state.editingExistingItem);


  return (
    <div className="flex flex-row justify-self-stretch h-full">
      <div className="flex-1 p-4 min-w-32 max-w-48 bg-sidebar flex flex-col gap-2"
        onClick={() => {
          console.log("project list-page click...");
          eventProjectPageClicked();
        }}
      >
        {projects.map((p) => {
          const variant = activeProjectUuid === p.uuid ? "default" : "shk";
          return (
            <Button
              key={p.uuid}
              className="text-base" variant={variant}
              onClick={(event) => {
                event.stopPropagation();
                requestProjectChange(p.uuid)
              }}>
              {p.title}
            </Button>
          );
        })}
        <Button
          className="text-sm mt-auto font-normal" variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            //requestNewProject()
          }}>
          <CirclePlus />Project/List
        </Button>
      </div>
      <div
        className="flex-3 p-4 w-1 overflow-y-auto">
        <div
          className="flex flex-col w-full min-h-full flex-1 gap-2 items-center"
          onClick={(event) => {
            event.stopPropagation();
            console.log("project main-page click...");
            eventProjectPageClicked();
          }}
        >
          {/* container for list of items */}
          {activeProjectUuid && <ListOfItemsContainer className="" items={items} newEdit={editingNewItem} existingEdit={editingExistingItem} modifiable />}
        </div>

      </div>
    </div>

  );
}

