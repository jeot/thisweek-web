import { ListOfItemsContainer } from '@/components/ListOfItems';
import { useAppLogic } from "@/store/appLogic";
import { Button } from './ui/button';
import { CirclePlus } from 'lucide-react';
import { CreateNewProjectCard } from './CreateNewProjectCard';

export function ProjectsPage() {
  const requestProjectChange = useAppLogic((state) => state.requestProjectChange);
  const eventProjectPageClicked = useAppLogic((state) => state.eventProjectPageClicked);
  const requestCreateNewProjectModal = useAppLogic((state) => state.requestCreateNewProjectModal);
  const items = useAppLogic((state) => state.projectItems);
  const projects = useAppLogic((state) => state.projects);
  const displayCreateNewProjectCard = useAppLogic((state) => state.modalView) === 'CreateNewProject';
  const activeProjectUuid = useAppLogic((state) => state.activeProjectUuid);
  const editingNewItem = useAppLogic((state) => state.editingNewItem);
  const editingExistingItem = useAppLogic((state) => state.editingExistingItem);


  return (
    <div className="flex flex-row justify-self-stretch h-full">
      <div className="flex-1 px-0 py-2 min-w-32 max-w-48 flex flex-col gap-0 border-e font-normal text-sm"
        onClick={() => {
          console.log("project list-page click...");
          eventProjectPageClicked();
        }}
      >
        {projects.map((p) => {
          const variant = activeProjectUuid === p.uuid ? "project_active" : "project_inactive";
          return (
            <Button
              key={p.uuid}
              size="project"
              className="text-sm" variant={variant}
              onClick={(event) => {
                event.stopPropagation();
                requestProjectChange(p.uuid)
              }}>
              {p.title}
            </Button>
          );
        })}
        <div className="text-sm mt-auto font-normal px-2">
          {displayCreateNewProjectCard &&
            <CreateNewProjectCard /> ||
            <Button
              className="w-full" variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                requestCreateNewProjectModal()
              }}>
              <CirclePlus />Project/List
            </Button>}
        </div>
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
          {activeProjectUuid && <ListOfItemsContainer className="" items={items} newEdit={editingNewItem} existingEdit={editingExistingItem} modifiable category='project' />}
        </div>

      </div>
    </div >

  );
}

