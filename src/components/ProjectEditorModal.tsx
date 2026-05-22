import { useEffect, useMemo, useState } from "react";
import { useAppLogic } from "@/store/appLogic";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Json } from "@/lib/supabase/database.types";

const PROJECT_NAME_MIN_LENGTH = 2;
const PROJECT_NAME_MAX_LENGTH = 60;
const COLOR_OPTIONS = ["", "#6b7280", "#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed"];
const ICON_OPTIONS = ["", "📁", "🚀", "🧠", "🎯", "📝", "💼", "🔧"];

type DraftState = {
  title: string;
  description: string;
  color: string;
  icon: string;
};

function parseMeta(meta: Json | null): { description: string, color: string, icon: string } {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return { description: "", color: "", icon: "" };
  }
  const obj = meta as Record<string, Json>;
  const description = typeof obj.description === "string" ? obj.description : "";
  const color = typeof obj.color === "string" ? obj.color : "";
  const icon = typeof obj.icon === "string" ? obj.icon : "";
  return { description, color, icon };
}

export function ProjectEditorModal() {
  const isMobile = useAppLogic((s) => s.isMobile);
  const modalView = useAppLogic((s) => s.modalView);
  const mode = useAppLogic((s) => s.projectEditorMode);
  const editProjectUuid = useAppLogic((s) => s.projectEditorProjectUuid);
  const projects = useAppLogic((s) => s.projects);
  const requestCloseProjectModal = useAppLogic((s) => s.requestCloseProjectModal);
  const requestSaveProjectEditor = useAppLogic((s) => s.requestSaveProjectEditor);
  const requestMoveProjectToTrash = useAppLogic((s) => s.requestMoveProjectToTrash);

  const open = modalView === "ProjectEditor";
  const editingProject = useMemo(() => {
    if (mode !== "edit" || !editProjectUuid) return null;
    return projects.find((p) => p.uuid === editProjectUuid) || null;
  }, [mode, editProjectUuid, projects]);

  const initialDraft = useMemo<DraftState>(() => {
    if (mode === "edit" && editingProject) {
      const parsed = parseMeta(editingProject.meta);
      return {
        title: editingProject.title || "",
        description: parsed.description || "",
        color: parsed.color || "",
        icon: parsed.icon || "",
      };
    }
    return { title: "", description: "", color: "", icon: "" };
  }, [mode, editingProject]);

  const [draft, setDraft] = useState<DraftState>(initialDraft);

  useEffect(() => {
    if (!open) return;
    setDraft(initialDraft);
  }, [open, initialDraft]);

  const trimmedTitle = draft.title.trim();
  const normalizedTitle = trimmedTitle.toLocaleLowerCase();
  const duplicateExists = projects.some((p) =>
    p.deletedAt === null
    && p.uuid !== (editingProject?.uuid || null)
    && p.title.trim().toLocaleLowerCase() === normalizedTitle
  );

  let nameError = "";
  if (trimmedTitle.length < PROJECT_NAME_MIN_LENGTH) {
    nameError = `Name should be at least ${PROJECT_NAME_MIN_LENGTH} characters.`;
  } else if (trimmedTitle.length > PROJECT_NAME_MAX_LENGTH) {
    nameError = `Name should be at most ${PROJECT_NAME_MAX_LENGTH} characters.`;
  } else if (duplicateExists) {
    nameError = "A project with this name already exists.";
  }

  const isDirty = (
    draft.title !== initialDraft.title
    || draft.description !== initialDraft.description
    || draft.color !== initialDraft.color
    || draft.icon !== initialDraft.icon
  );
  const canSubmit = nameError.length === 0 && (mode === "create" || isDirty);

  function attemptClose() {
    if (isDirty) {
      const confirmDiscard = window.confirm("Discard unsaved project changes?");
      if (!confirmDiscard) return;
    }
    requestCloseProjectModal();
  }

  function submit() {
    if (!canSubmit) return;
    requestSaveProjectEditor({
      title: draft.title,
      description: draft.description,
      color: draft.color,
      icon: draft.icon,
    });
  }

  const title = mode === "create" ? "New Project" : "Edit Project";
  const subtitle = mode === "create"
    ? "Create a project now and you can refine details later."
    : "Rename and manage project details.";

  const body = (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border p-3">
        <p className="text-xs text-muted-foreground mb-2">Preview</p>
        <div className="flex items-center gap-2">
          <span className="text-lg">{draft.icon || "📁"}</span>
          <span
            className="inline-block size-3 rounded-full border"
            style={{ backgroundColor: draft.color || "#9ca3af" }}
          />
          <span className="font-medium truncate">{trimmedTitle || "Untitled Project"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="project-title">Name</label>
        <Input
          id="project-title"
          value={draft.title}
          autoFocus
          placeholder="Project name..."
          onChange={(e) => setDraft((x) => ({ ...x, title: e.target.value }))}
        />
        {nameError && <p className="text-xs text-destructive">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="project-description">Description</label>
        <Textarea
          id="project-description"
          value={draft.description}
          placeholder="Optional project description..."
          rows={3}
          onChange={(e) => setDraft((x) => ({ ...x, description: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Color</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => {
            const selected = draft.color === color;
            return (
              <button
                key={color || "none"}
                type="button"
                className={`size-7 rounded-full border ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
                style={{ backgroundColor: color || "transparent" }}
                aria-label={color || "No color"}
                onClick={() => setDraft((x) => ({ ...x, color }))}
              >
                {!color && <span className="text-xs">X</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Icon</p>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((icon) => {
            const selected = draft.icon === icon;
            return (
              <button
                key={icon || "none"}
                type="button"
                className={`h-8 min-w-8 rounded border px-2 ${selected ? "border-primary bg-primary/10" : ""}`}
                aria-label={icon || "No icon"}
                onClick={() => setDraft((x) => ({ ...x, icon }))}
              >
                {icon || "None"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const footer = (
    <>
      {mode === "edit" && editingProject && (
        <Button
          type="button"
          variant="destructive"
          className="mr-auto"
          onClick={() => {
            const confirmed = window.confirm("Move this project to Trash?");
            if (!confirmed) return;
            requestMoveProjectToTrash(editingProject.uuid);
          }}
        >
          Move To Trash
        </Button>
      )}
      <Button type="button" variant="secondary" onClick={attemptClose}>Cancel</Button>
      <Button type="button" onClick={submit} disabled={!canSubmit}>
        {mode === "create" ? "Create" : "Save"}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(o) => { if (!o) attemptClose(); }}>
        <SheetContent side="bottom" className="h-dvh max-w-full overflow-auto rounded-none p-4">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{subtitle}</SheetDescription>
          </SheetHeader>
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {body}
            <SheetFooter className="mt-6">{footer}</SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) attemptClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {body}
          <DialogFooter className="mt-6">{footer}</DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
