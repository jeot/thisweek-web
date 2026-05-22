import { ListOfItemsContainer } from '@/components/ListOfItems';
import { useAppLogic } from "@/store/appLogic";
import { Button } from './ui/button';
import { CirclePlus, FolderOpen, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { ProjectEditorModal } from './ProjectEditorModal';
import { Json } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils';

function getProjectMeta(meta: Json | null): { icon: string, color: string } {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return { icon: "", color: "" };
  }
  const obj = meta as Record<string, Json>;
  const icon = typeof obj.icon === "string" ? obj.icon : "";
  const color = typeof obj.color === "string" ? obj.color : "";
  return { icon, color };
}

export function ProjectsPage() {
  const requestProjectChange = useAppLogic((state) => state.requestProjectChange);
  const eventProjectPageClicked = useAppLogic((state) => state.eventProjectPageClicked);
  const requestCreateNewProjectModal = useAppLogic((state) => state.requestCreateNewProjectModal);
  const requestEditProjectModal = useAppLogic((state) => state.requestEditProjectModal);
  const requestRestoreProjectFromTrash = useAppLogic((state) => state.requestRestoreProjectFromTrash);
  const requestDeleteProjectPermanently = useAppLogic((state) => state.requestDeleteProjectPermanently);
  const requestProjectSidebarViewChange = useAppLogic((state) => state.requestProjectSidebarViewChange);
  const items = useAppLogic((state) => state.projectItems);
  const projects = useAppLogic((state) => state.projects);
  const trashedProjects = useAppLogic((state) => state.trashedProjects);
  const projectSidebarView = useAppLogic((state) => state.projectSidebarView);
  const activeProjectUuid = useAppLogic((state) => state.activeProjectUuid);
  const editingNewItem = useAppLogic((state) => state.editingNewItem);
  const editingExistingItem = useAppLogic((state) => state.editingExistingItem);
  const toggleDebugInfo = useAppLogic((s) => s.toggleDebugInfo);


  return (
    <div className="flex flex-row justify-self-stretch h-full">
      {/* the left projects list (sidebar) */}
      <div className="flex-1 p-0 pb-2 min-w-32 max-w-48 flex flex-col gap-0 border-e font-normal text-sm overflow-y-auto"
        onClick={() => {
          console.log("project list-page click...");
          eventProjectPageClicked();
        }}
      >
        {projects.map((p) => {
          const meta = getProjectMeta(p.meta);
          const variant = activeProjectUuid === p.uuid ? "project_active" : "project_inactive";
          return (
            <div key={p.uuid} className="relative flex items-center border-b border-border/30 last:border-b-0">
              <Button
                size="project"
                className="text-sm flex-1 justify-start" variant={variant}
                onClick={(event) => {
                  event.stopPropagation();
                  requestProjectChange(p.uuid)
                }}>
                {meta.icon && <span>{meta.icon}</span>}
                {meta.color && (
                  <span
                    className="inline-block size-2.5 rounded-full border border-border/60"
                    style={{ backgroundColor: meta.color }}
                  />
                )}
                <span className="truncate">{p.title}</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none h-9 w-9"
                aria-label={`Edit ${p.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  requestEditProjectModal(p.uuid);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              {toggleDebugInfo && <div dir="ltr"
                className={cn("flex absolute right-0 top-0 text-xxs px-1 border-1 border-border")}>
                {/*<span className={cn("right-0 top-0 rounded-md", "text-pink-600")}>{p.ordering}</span>*/}
                &nbsp;
                <span className={cn(
                  p.syncedAt && "text-green-500" || "text-orange-500",
                  "font-semibold",

                )} >{p.ordering}</span>
              </div>}
            </div>
          );
        })}
        <div className="text-sm mt-auto font-normal p-2 flex flex-col gap-2 border-t">
          <Button
            className="w-full" variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              requestCreateNewProjectModal()
            }}>
            <CirclePlus />Project/List
          </Button>
          <Button
            className="w-full"
            variant={projectSidebarView === 'trash' ? "secondary" : "outline"}
            onClick={(event) => {
              event.stopPropagation();
              requestProjectSidebarViewChange(projectSidebarView === 'trash' ? 'active' : 'trash');
            }}
          >
            <Trash2 />Trash ({trashedProjects.length})
          </Button>
        </div>
      </div>
      {/* the right project content */}
      <div className="flex-3 p-4 w-1 overflow-y-auto">
        <div
          className="flex flex-col w-full min-h-full flex-1 gap-2 items-center"
          onClick={(event) => {
            event.stopPropagation();
            console.log("project main-page click...");
            eventProjectPageClicked();
          }}
        >
          {/* container for list of items */}
          {projectSidebarView === 'active' && activeProjectUuid &&
            <ListOfItemsContainer className="" items={items} newEdit={editingNewItem} existingEdit={editingExistingItem} modifiable category='project' />}
          {projectSidebarView === 'active' && !activeProjectUuid &&
            <p className="m-auto text-muted-foreground">Select a Project/List</p>}
          {projectSidebarView === 'trash' &&
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Trash ({trashedProjects.length})</p>
              {trashedProjects.length === 0 &&
                <div className="border rounded-md p-4 text-sm text-muted-foreground">Trash is empty.</div>}
              {trashedProjects.map((p) => (
                <div key={p.uuid} className="border rounded-md p-3 flex items-center gap-2">
                  <FolderOpen className="size-4 text-muted-foreground" />
                  <span className="truncate flex-1">{p.title}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      requestRestoreProjectFromTrash(p.uuid);
                    }}
                  >
                    <RotateCcw className="size-4" />Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const confirmed = window.confirm(`Delete "${p.title}" permanently? This will also remove its items.`);
                      if (!confirmed) return;
                      requestDeleteProjectPermanently(p.uuid);
                    }}
                  >
                    <Trash2 className="size-4" />Delete
                  </Button>
                </div>
              ))}
            </div>}
        </div>

      </div>
      <ProjectEditorModal />
    </div >

  );
}
