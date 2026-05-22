import { CategoryType, ItemType, ModalViewType, PageViewType, ProjectType } from '@/types/types';
import { create } from 'zustand';
import {
	async_saveDraftItem,
	async_deleteDraftItem,
	async_deleteItemSoft,
	async_saveAsNewItem,
	async_saveItem,
	createNewItem,
	getNewOrderingNumber,
	async_createNewProject,
	async_getProjectByUuid,
	async_saveProject,
	async_deleteProjectSoft,
	async_restoreProjectSoft,
	async_deleteProjectHard
} from '@/lib/items';
import { Action } from '@/types/types';
import { useCalendarConfig } from './calendarConfig';
import { useThemeConfig } from './themeConfig';
import { timeToISO } from '@/lib/utils';
import { useDataSyncStore } from './dataSyncStore';
import { useOtherConfigs } from './otherConfigs';
import { Json } from '@/lib/supabase/database.types';

export type SettingPageType = 'General' | 'Calendars' | 'Keymaps' | 'About';
export type LoginInfoModalType = 'login' | 'sign-up' | 'forgot-password' | 'logged-in' | 'update-password' | null;
export type ProjectEditorModeType = 'create' | 'edit';
export type ProjectSidebarViewType = 'active' | 'trash';

const PROJECT_NAME_MIN_LENGTH = 2;
const PROJECT_NAME_MAX_LENGTH = 60;

type ProjectMetaType = {
	description?: string;
	color?: string;
	icon?: string;
};

function buildProjectMeta(meta: ProjectMetaType): Json {
	return {
		description: meta.description || "",
		color: meta.color || "",
		icon: meta.icon || "",
	} as Json;
}

function validateProjectName(
	nameInput: string,
	projects: ProjectType[],
	currentUuid: string | null = null
): string | null {
	const trimmed = nameInput.trim();
	if (trimmed.length < PROJECT_NAME_MIN_LENGTH) {
		return `Name should be at least ${PROJECT_NAME_MIN_LENGTH} characters.`;
	}
	if (trimmed.length > PROJECT_NAME_MAX_LENGTH) {
		return `Name should be at most ${PROJECT_NAME_MAX_LENGTH} characters.`;
	}
	const normalized = trimmed.toLocaleLowerCase();
	const duplicate = projects.find((p) =>
		p.deletedAt === null
		&& p.uuid !== currentUuid
		&& p.title.trim().toLocaleLowerCase() === normalized
	);
	if (duplicate) return "A project with this name already exists.";
	return null;
}

type AppLogic = {
	// ui
	showLoginInfoModal: LoginInfoModalType;
	setShowLoginInfoModal: (t: LoginInfoModalType) => void;
	pageView: PageViewType;
	modalView: ModalViewType;
	projectEditorMode: ProjectEditorModeType;
	projectEditorProjectUuid: string | null;
	projectSidebarView: ProjectSidebarViewType;
	settingPage: SettingPageType;
	weekReference: string;
	internalCopiedItem: ItemType | null;
	selectedId: number | null;
	wiggleId: number | null;
	isMobile: boolean;
	setIsMobile: (b: boolean) => void;
	editingCaretPosition: 'caret_start' | 'caret_end' | 'caret_select_all' | null;
	toggleDebugInfo: boolean;

	// data
	weeklyItems: ItemType[];
	projectItems: ItemType[];
	projects: ProjectType[];
	trashedProjects: ProjectType[];
	activeProjectUuid: string | null;
	editingNewItem: ItemType | null;
	editingExistingItem: ItemType | null;
	unsyncedItemsCount: number;
	setWeeklyItemsForced: (items: ItemType[]) => void;
	setProjectItemsForced: (items: ItemType[]) => void;
	setProjectsForced: (items: ProjectType[]) => void;
	setTrashedProjectsForced: (items: ProjectType[]) => void;
	setEditingNewItemsForced: (item: ItemType | null) => void;
	setEditingExistingItemsForced: (item: ItemType | null) => void;
	setUnsyncedItemsCount: (count: number) => void;
	getItemsReference: () => ItemType[];
	getCategoryBasedOnPageView: () => CategoryType;

	// helper functions
	findItemInList: (item: ItemType) => ItemType | null;
	findItemIndex: (item: ItemType) => number | null;
	getEditingItemId: () => number | null;
	cancelEditingItemIfNotChanged: () => boolean;
	easyCheckForCancelingUnchangedEditingItemOrWiggle: () => boolean;
	wiggleEditingItem: () => void;

	// components requesting some action
	requestPageViewChange: (page: PageViewType) => void;
	requestSettingPageChange: (page: SettingPageType) => void;
	requestBeginEditingNewItem: (firstIndex: number, secondIndex: number) => void;
	requestBeginEditingExistingItem: (item: ItemType, caretPosition?: 'caret_start' | 'caret_end' | 'caret_select_all') => void;
	moveItemScheduleTimeByWeeks: (item: ItemType, weekOffset: number, follow?: boolean, select?: boolean) => void;
	moveItemScheduleTimeToThisWeek: (item: ItemType, weekOffset?: number, follow?: boolean, select?: boolean) => void;
	requestGoToToday: () => void;
	requestWeekChange: (weekOffset: number) => void;
	requestProjectChange: (projectUuid: string | null) => void;
	requestCreateNewProject: (projectTitle: string | null) => void;
	requestCreateNewProjectModal: () => void;
	requestEditProjectModal: (projectUuid: string) => void;
	requestCloseProjectModal: () => void;
	requestSaveProjectEditor: (payload: { title: string, description?: string, color?: string, icon?: string }) => void;
	requestMoveProjectToTrash: (projectUuid: string) => void;
	requestRestoreProjectFromTrash: (projectUuid: string) => void;
	requestDeleteProjectPermanently: (projectUuid: string) => void;
	requestProjectSidebarViewChange: (view: ProjectSidebarViewType) => void;
	requestChangeSelectedItemById: (id: number | null) => void;
	requestMoveItemUpOrDown: (item: ItemType, offset: number) => void;
	requestDeleteItem: (item: ItemType) => void;
	requestUpdateItem: (item: ItemType) => void;
	requestUpdateEditingItem: (item: ItemType) => void;
	requestApplyEditingItem: (item: ItemType) => void;
	requestCancelEditingItem: () => void;
	requestCopyItem: (item: ItemType) => void;
	requestPasteAtItem: (item: ItemType) => void;
	requestPasteAtIndex: (index: number) => void;
	requestToggleItemStatus: (item: ItemType) => void;
	requestToggleItemType: (item: ItemType) => void;
	requestCancelWhateverIsHappening: () => void;

	// some events from components
	eventWeekPageClicked: () => void;
	eventProjectPageClicked: () => void;
	eventItemWasClicked: (item: ItemType) => void;
	eventItemContextMenuOpened: (item: ItemType) => void;

	// actions (keyboard mostly or events)
	actionRequest: (action: Action) => void,
};

export const useAppLogic = create<AppLogic>((set, get) => ({
	showLoginInfoModal: null,
	setShowLoginInfoModal: (t) => set({ showLoginInfoModal: t }),
	pageView: 'This Week',
	modalView: null,
	projectEditorMode: 'create',
	projectEditorProjectUuid: null,
	projectSidebarView: 'active',
	settingPage: 'Calendars',
	weekReference: timeToISO(),
	internalCopiedItem: null,
	selectedId: null,
	wiggleId: null,
	isMobile: false,
	setIsMobile: (b) => set({ isMobile: b }),
	toggleDebugInfo: false,

	weeklyItems: [],
	projectItems: [],
	projects: [],
	trashedProjects: [],
	activeProjectUuid: null,
	editingNewItem: null,
	editingExistingItem: null,
	editingCaretPosition: null,
	unsyncedItemsCount: 0,
	setWeeklyItemsForced: (items) => set({ weeklyItems: items }),
	setProjectItemsForced: (items) => set({ projectItems: items }),
	setProjectsForced: (projects: ProjectType[]) => set({ projects: projects }),
	setTrashedProjectsForced: (projects: ProjectType[]) => set({ trashedProjects: projects }),
	setEditingNewItemsForced: (item) => {
		set({ editingNewItem: item });
		if (item) set({ weekReference: item.scheduledAt });
	},
	setEditingExistingItemsForced: (item) => {
		set({ editingExistingItem: item });
		if (item) set({ weekReference: item.scheduledAt });
	},
	setUnsyncedItemsCount: (count: number) => set({ unsyncedItemsCount: count }),
	getItemsReference: () => {
		const logic = get();
		const category = logic.getCategoryBasedOnPageView();
		if (category === "weekly") return logic.weeklyItems;
		if (category === "project") return logic.projectItems;
		return [];
	},
	getCategoryBasedOnPageView: () => {
		const logic = get();
		if (logic.pageView === "This Week") return 'weekly';
		if (logic.pageView === "Projects") return 'project';
		return 'daily'; // an undefined value!
	},

	// helper functions

	findItemInList: (item) => {
		const itemsRef = get().getItemsReference();
		return (itemsRef.find((i) => (i.id === item.id && i.uuid === item.uuid)) || null);
	},
	findItemIndex: (item) => {
		const itemsRef = get().getItemsReference();
		const index = itemsRef.findIndex((i) => (i.id === item.id && i.uuid === item.uuid));
		if (index < 0) return null;
		else return index;
	},
	getEditingItemId: () => {
		const logic = get();
		if (logic.editingExistingItem) {
			return logic.editingExistingItem.id;
		} else if (logic.editingNewItem) {
			return logic.editingNewItem.id;
		} else {
			return null;
		}
	},
	wiggleEditingItem: () => {
		const logic = get();
		if (logic.editingExistingItem) {
			set({ wiggleId: logic.editingExistingItem.id });
			setTimeout(() => set({ wiggleId: null }), 300); // same as animation duration
		} else if (logic.editingNewItem) {
			set({ wiggleId: logic.editingNewItem.id });
			setTimeout(() => set({ wiggleId: null }), 300); // same as animation duration
		} else {
			set({ wiggleId: null });
		}
	},
	cancelEditingItemIfNotChanged: () => {
		const logic = get();
		const itemsRef = logic.getItemsReference();
		const originalItemTitle = itemsRef.find((i) => (i.id === logic.editingExistingItem?.id))?.title;
		if (logic.editingExistingItem && logic.editingExistingItem.title === originalItemTitle) {
			logic.setEditingExistingItemsForced(null);
			async_deleteDraftItem('editing_existing');
			return true;
		}
		if (logic.editingNewItem && logic.editingNewItem.title.trimEnd() === "") {
			logic.setEditingNewItemsForced(null);
			async_deleteDraftItem('editing_new');
			return true;
		}
		if (logic.editingNewItem || logic.editingExistingItem) {
			return false;
		} else {
			return true; // tells that there is notting to cancel!
		}
	},
	easyCheckForCancelingUnchangedEditingItemOrWiggle: () => {
		const logic = get();
		if (logic.getEditingItemId() !== null) {
			if (!logic.cancelEditingItemIfNotChanged()) logic.wiggleEditingItem();
			return false;
		}
		return true;
	},

	// components requesting some action

	requestPageViewChange: (page) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		useOtherConfigs.getState().setCurrentPage(page, true);
		set({ pageView: page });
	},
	requestSettingPageChange: (page: SettingPageType) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		if (logic.pageView === 'Settings') set({ settingPage: page });
	},
	requestBeginEditingNewItem: (firstIndex, secondIndex) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		if (logic.pageView === 'This Week') {
			const category = "weekly";
			const ordering = getNewOrderingNumber(logic.weeklyItems, firstIndex, secondIndex, category);
			const newItem = createNewItem(category, ordering);
			logic.setEditingNewItemsForced(newItem);
		} else if (logic.pageView === "Projects" && logic.activeProjectUuid) {
			const category = "project";
			const ordering = getNewOrderingNumber(logic.projectItems, firstIndex, secondIndex, category);
			const newItem = createNewItem(category, ordering);
			newItem.projectId = logic.activeProjectUuid;
			logic.setEditingNewItemsForced(newItem);
		} else {
			console.error("fatal! should not happen");
			return;
		}
	},
	requestBeginEditingExistingItem: (item, caretPosition = 'caret_end') => {
		const logic = get();
		if (!logic.findItemInList(item)) return;
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ editingCaretPosition: caretPosition });
		logic.setEditingExistingItemsForced(item);
	},
	moveItemScheduleTimeByWeeks: (item, weekOffset, follow = true, select = true) => {
		const logic = get();
		if (logic.pageView !== 'This Week') return;
		if (!logic.findItemInList(item)) return;
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const newSchedule = timeToISO(item.scheduledAt, weekOffset);
		item.scheduledAt = newSchedule;
		async_saveItem(item)
			.then((count) => {
				if (count === null) return; // not successful!
				if (follow) set({ weekReference: newSchedule });
				if (select) set({ selectedId: item.id });
			})
			.catch((err) => console.log("err:", err));
	},
	moveItemScheduleTimeToThisWeek: (item, weekOffset = 0, follow = true, select = true) => {
		const logic = get();
		if (!logic.findItemInList(item)) return;
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const newSchedule = timeToISO(undefined, weekOffset);
		item.scheduledAt = newSchedule;
		async_saveItem(item)
			.then((count) => {
				if (count === null) return; // not successful!
				if (follow) set({ weekReference: newSchedule });
				if (select) set({ selectedId: item.id });
			})
			.catch((err) => console.log("err:", err));
	},
	requestGoToToday: () => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ weekReference: timeToISO() });
	},
	requestWeekChange: (weekOffset) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ weekReference: timeToISO(logic.weekReference, weekOffset) })
		set({ selectedId: null });
	},
	requestProjectChange: (projectUuid) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ projectSidebarView: 'active' });
		useOtherConfigs.getState().setCurrentProject(projectUuid, true);
		set({ activeProjectUuid: projectUuid });
		set({ selectedId: null });
	},
	requestCreateNewProject: (projectTitle: string | null) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) {
			console.error("@requestCreateNewProject: fatal error! this should not happen!");
			set({ modalView: null, projectEditorProjectUuid: null });
			return;
		}
		if (projectTitle && logic.pageView === 'Projects' && logic.modalView === 'ProjectEditor') {
			const title = projectTitle.trim();
			const error = validateProjectName(title, logic.projects, null);
			if (error) return;
			async_createNewProject(title)
				.then((uuid) => {
					if (uuid === null) return;
					set({
						modalView: null,
						projectEditorProjectUuid: null,
						projectSidebarView: 'active',
						activeProjectUuid: uuid
					});
				})
				.catch((err) => console.log("err:", err));
		} else {
			set({ modalView: null, projectEditorProjectUuid: null });
		}
	},
	requestCreateNewProjectModal: () => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		if (logic.pageView === 'Projects') {
			set({
				modalView: 'ProjectEditor',
				projectEditorMode: 'create',
				projectEditorProjectUuid: null,
			});
		}
		else set({ modalView: null, projectEditorProjectUuid: null });
	},
	requestEditProjectModal: (projectUuid: string) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		if (logic.pageView !== 'Projects') return;
		const project = logic.projects.find((p) => p.uuid === projectUuid && p.deletedAt === null) || null;
		if (!project) return;
		set({
			modalView: 'ProjectEditor',
			projectEditorMode: 'edit',
			projectEditorProjectUuid: projectUuid
		});
	},
	requestCloseProjectModal: () => {
		set({ modalView: null, projectEditorProjectUuid: null });
	},
	requestSaveProjectEditor: (payload) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		if (logic.pageView !== 'Projects') return;
		if (logic.modalView !== 'ProjectEditor') return;

		const title = payload.title.trim();
		const description = (payload.description || "").trim();
		const color = (payload.color || "").trim();
		const icon = (payload.icon || "").trim();
		const editingUuid = logic.projectEditorMode === 'edit' ? logic.projectEditorProjectUuid : null;
		const error = validateProjectName(title, logic.projects, editingUuid);
		if (error) return;

		if (logic.projectEditorMode === 'create') {
			async_createNewProject(title)
				.then((uuid) => {
					if (uuid === null) return;
					async_getProjectByUuid(uuid)
						.then((createdProject) => {
							if (!createdProject) {
								set({
									modalView: null,
									projectEditorProjectUuid: null,
									projectSidebarView: 'active',
									activeProjectUuid: uuid
								});
								return;
							}
							createdProject.meta = buildProjectMeta({ description, color, icon });
							async_saveProject(createdProject)
								.then(() => {
									set({
										modalView: null,
										projectEditorProjectUuid: null,
										projectSidebarView: 'active',
										activeProjectUuid: uuid
									});
								})
								.catch((err) => console.log("err:", err));
						})
						.catch((err) => console.log("err:", err));
				})
				.catch((err) => console.log("err:", err));
			return;
		}

		const projectUuid = logic.projectEditorProjectUuid;
		if (!projectUuid) return;
		const project = logic.projects.find((p) => p.uuid === projectUuid && p.deletedAt === null) || null;
		if (!project) return;
		project.title = title;
		project.meta = buildProjectMeta({ description, color, icon });
		async_saveProject(project)
			.then((result) => {
				if (!result) return;
				set({ modalView: null, projectEditorProjectUuid: null });
			})
			.catch((err) => console.log("err:", err));
	},
	requestMoveProjectToTrash: (projectUuid: string) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const project = logic.projects.find((p) => p.uuid === projectUuid && p.deletedAt === null) || null;
		if (!project) return;
		async_deleteProjectSoft(project)
			.then((result) => {
				if (!result) return;
				const shouldClearSelection = (logic.activeProjectUuid === projectUuid);
				set({
					modalView: null,
					projectEditorProjectUuid: null,
					activeProjectUuid: shouldClearSelection ? null : logic.activeProjectUuid,
					selectedId: shouldClearSelection ? null : logic.selectedId
				});
			})
			.catch((err) => console.log("err:", err));
	},
	requestRestoreProjectFromTrash: (projectUuid: string) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const project = logic.trashedProjects.find((p) => p.uuid === projectUuid && p.deletedAt !== null) || null;
		if (!project) return;
		const titleError = validateProjectName(project.title, logic.projects, project.uuid);
		if (titleError) {
			console.log("restore blocked due to duplicate title.");
			return;
		}
		async_restoreProjectSoft(project)
			.then((result) => {
				if (!result) return;
				set({ projectSidebarView: 'active' });
			})
			.catch((err) => console.log("err:", err));
	},
	requestDeleteProjectPermanently: (projectUuid: string) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const project = logic.trashedProjects.find((p) => p.uuid === projectUuid) || null;
		if (!project) return;
		async_deleteProjectHard(project)
			.then((result) => {
				if (!result) return;
				if (logic.projectEditorProjectUuid === projectUuid) {
					set({ modalView: null, projectEditorProjectUuid: null });
				}
			})
			.catch((err) => console.log("err:", err));
	},
	requestProjectSidebarViewChange: (view) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ projectSidebarView: view });
		if (view === 'trash') {
			set({ activeProjectUuid: null, selectedId: null });
		}
	},
	requestChangeSelectedItemById: (id) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ selectedId: id });
	},
	requestMoveItemUpOrDown: (item: ItemType, offset: number) => {
		const logic = get();
		const itemsRef = logic.getItemsReference();
		const category = logic.getCategoryBasedOnPageView();
		if (!logic.findItemInList(item)) return;
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const index = logic.findItemIndex(item); if (index === null) return;
		console.log("⬆️⬇️");
		const nextOffset = offset >= 0 ? offset + 1 : offset - 1;
		const newOrder = getNewOrderingNumber(itemsRef, index + offset, index + nextOffset, category)
		item.ordering = { ...item.ordering, [category]: newOrder };
		async_saveItem(item)
			.then(() => { })
			.catch((err) => console.log("err:", err));
	},
	requestDeleteItem: (item: ItemType) => {
		const logic = get();
		if (!logic.findItemInList(item)) return;
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const index = logic.findItemIndex(item); if (index === null) return;
		async_deleteItemSoft(item)
			.then((result) => {
				if (!result) { console.log("error deleting item"); return }
				if (item.id === logic.selectedId) set({ selectedId: null });
			})
			.catch((err) => console.log("err:", err));
	},
	requestUpdateItem: (item: ItemType) => {
		const logic = get();
		if (logic.findItemInList(item)) {
			async_saveItem(item)
				.then(() => { })
				.catch((err) => console.log("err:", err));
		} else {
			console.log("error! item not in the list! should not happen!");
		}
	},
	requestUpdateEditingItem: (item: ItemType) => {
		const logic = get();
		if (logic.editingExistingItem && item.id === logic.editingExistingItem.id && item.uuid === logic.editingExistingItem.uuid) {
			logic.setEditingExistingItemsForced(item);
			async_saveDraftItem(item, 'editing_existing')
				.then(() => { console.log(".") })
				.catch((err) => console.log("err:", err));
		} else if (logic.editingNewItem !== null && item.uuid === logic.editingNewItem.uuid) {
			logic.setEditingNewItemsForced(item);
			async_saveDraftItem(item, 'editing_new')
				.then(() => { console.log(".") })
				.catch((err) => console.log("err:", err));
		} else {
			console.log("error! should not happen!");
		}
	},
	requestApplyEditingItem: (item: ItemType) => {
		const logic = get();
		if (logic.editingExistingItem && item.id === logic.editingExistingItem.id && item.uuid === logic.editingExistingItem.uuid) {
			async_saveItem(item)
				.then((count) => {
					if (!count) return;
					set({ editingExistingItem: null, selectedId: item.id });
					async_deleteDraftItem('editing_existing')
						.then(() => { })
						.catch((err) => console.log("err:", err));
				})
				.catch((err) => console.log("err:", err));
		} else if (logic.editingNewItem !== null && item.uuid === logic.editingNewItem.uuid) {
			async_saveAsNewItem(item)
				.then((id) => {
					if (id === null) return;
					set({ editingNewItem: null, selectedId: id });
					async_deleteDraftItem('editing_new')
						.then(() => { })
						.catch((err) => console.log("err:", err));
				})
				.catch((err) => console.log("err:", err));
		} else {
			console.log("error! should not happen!");
		}
	},
	requestCancelEditingItem: () => {
		set({ editingNewItem: null, editingExistingItem: null });
		async_deleteDraftItem('editing_new')
			.then(() => { })
			.catch((err) => console.log("err:", err));
		async_deleteDraftItem('editing_existing')
			.then(() => { })
			.catch((err) => console.log("err:", err));
	},
	requestCopyItem: (item: ItemType) => {
		navigator.clipboard.writeText(item.title)
			.then(() => { console.log("write to clipboard done."); })
			.catch((err) => { console.log("write to clipboard failed. err:", err); });
		set({ internalCopiedItem: item });
		console.log("internal copy done.");
	},
	requestPasteAtItem: (item: ItemType) => {
		const logic = get();
		const index = logic.findItemIndex(item); if (index === null) return;
		logic.requestPasteAtIndex(index);
	},
	requestPasteAtIndex: (index: number) => {
		/*
		// the test for debugging the issue with copy/paste!
		// windows replaces the \n with \r\n
		// that's why we use the normalize function bellow
		// console.log("text from os clipboard:", text);
		// console.log("text from internal ref:", smartClipboardItemRef.current?.text);
		// console.log("text from os clipboard:", JSON.stringify(text));
		// console.log("text from internal ref:", JSON.stringify(smartClipboardItemRef.current?.text));
		// console.log("length text from os clipboard:", text.length);
		// console.log("length text from internal ref:", smartClipboardItemRef.current?.text.length);
		// console.log("os clipboard split by line:", text.split(''));
		// console.log("internal ref split by line:", smartClipboardItemRef.current.text.split(''));
		// const hash = s => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
		// console.log("Clipboard hash:", hash(text));
		// console.log("Internal hash:", hash(smartClipboardItemRef.current.text));
		*/
		// navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
		//	.then((result) => console.log("permission: ", result.state)); // 'granted', 'denied', or 'prompt'
		//	.catch((err) => console.log("err:", err));
		console.log("trying to get the text from clipboard...");
		navigator.clipboard.readText()
			.then((clipboardText) => {
				const text = clipboardText.trim();
				console.log("pasting text: ", text);
				if (text.length == 0) {
					console.log("no text to paste. ignored");
					return;
				}
				// some more code...
				const logic = get();
				if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
				const normalize = (str: string) => str.replace(/\r\n/g, '\n');
				const internalCopy = (logic.internalCopiedItem && (normalize(text) === normalize(logic.internalCopiedItem.title))) || false;
				const category = logic.getCategoryBasedOnPageView();
				const itemsRef = logic.getItemsReference();
				const newItemPosition = getNewOrderingNumber(itemsRef, index, index + 1, category)
				if (internalCopy && logic.internalCopiedItem) {
					let newItem = logic.internalCopiedItem;
					newItem.category = category;
					if (category === "weekly") {
						newItem.ordering = { ...newItem.ordering, weekly: newItemPosition };
						newItem.scheduledAt = logic.weekReference;
					} else if (category === "project" && logic.activeProjectUuid) {
						newItem.projectId = logic.activeProjectUuid;
						newItem.ordering = { ...newItem.ordering, project: newItemPosition };
						newItem.scheduledAt = timeToISO();
					} else {
						console.error("fatal! invalid category: ", category);
						return;
					}
					async_saveAsNewItem(newItem)
						.then((id) => {
							if (id === null) return;
							set({ selectedId: id });
						})
						.catch((err) => console.log("err:", err));
				} else if (!internalCopy) {
					let newItem = createNewItem(category);
					newItem.category = category;
					newItem.title = text;
					if (category === "weekly") {
						newItem.ordering = { ...newItem.ordering, weekly: newItemPosition };
						newItem.scheduledAt = logic.weekReference;
					} else if (category === "project" && logic.activeProjectUuid) {
						newItem.projectId = logic.activeProjectUuid;
						newItem.ordering = { ...newItem.ordering, project: newItemPosition };
						newItem.scheduledAt = timeToISO();
					} else {
						console.error("fatal! invalid category: ", category);
						return;
					}
					async_saveAsNewItem(newItem)
						.then((id) => {
							if (id === null) return;
							set({ selectedId: id });
						})
						.catch((err) => console.log("err:", err));
				} else {
				}
			})
			.catch((err) => { console.log("error read text from clipboard. err:", err); });
	},
	requestToggleItemStatus: (item: ItemType) => {
		const logic = get();
		item.status = (item.status === 'done') ? 'undone' : 'done';
		logic.requestUpdateItem(item);
	},
	requestToggleItemType: (item: ItemType) => {
		const logic = get();
		item.type = (item.type === 'todo') ? 'note' : 'todo';
		logic.requestUpdateItem(item);
	},
	requestCancelWhateverIsHappening: () => {
		const logic = get();
		if (logic.editingExistingItem) {
			logic.requestCancelEditingItem();
		} else if (logic.editingNewItem) {
			logic.requestCancelEditingItem();
		} else if (logic.selectedId !== null) {
			logic.requestChangeSelectedItemById(null);
		} else if (logic.activeProjectUuid !== null) {
			logic.requestProjectChange(null);
		} else {
			console.log("🤷‍♂");
		}
	},

	// some events from components
	eventWeekPageClicked: () => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		logic.requestChangeSelectedItemById(null);
	},
	eventProjectPageClicked: () => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		logic.requestChangeSelectedItemById(null);
	},
	eventItemWasClicked: (item) => {
		const logic = get();
		if (logic.getEditingItemId() === item.id) return;
		if (logic.selectedId === item.id) logic.requestChangeSelectedItemById(null);
		else logic.requestChangeSelectedItemById(item.id);
	},
	eventItemContextMenuOpened: (item) => {
		const logic = get();
		if (logic.getEditingItemId() === item.id) return;
		if (!logic.cancelEditingItemIfNotChanged()) return;
		logic.requestChangeSelectedItemById(item.id);
	},

	// actions (keyboard mostly or events)
	// most of the actions is performed on selectedItem
	actionRequest: (action: Action) => {
		// console.log("new action: ", action);
		// allowed actions dispite of model being open
		if (action === "TOGGLE_THEME") return useThemeConfig.getState().toggleTheme();
		if (action === "RUN_SYNC_ONCE") return useDataSyncStore.getState().startSync();
		if (action === "TOGGLE_DEBUG_INFO") return set({ toggleDebugInfo: !get().toggleDebugInfo })
		const logic = get();
		// other actions are not allowed if modal is open
		if (logic.showLoginInfoModal) {
			return;
		}
		const ltr = (useCalendarConfig.getState().mainCal.locale.direction === 'ltr');
		const category = logic.getCategoryBasedOnPageView();
		const itemsRef = logic.getItemsReference();
		const itemsLength = itemsRef.length;
		const selectedIndex: number = itemsRef.findIndex((item) => (item.id === logic.selectedId));
		const selectedIndexNotValid = ((selectedIndex < 0) || (selectedIndex >= itemsLength));
		const selectedItem = itemsRef.find((item) => (item.id === logic.selectedId)) || null;
		if (!action) {
		} else if (action === "TODAY") {
			if (category == "weekly") {
				logic.requestGoToToday();
			}
		} else if (action === "UP" || action === "DOWN") {
			let newIndex = 0;
			if (action === "UP" && selectedIndexNotValid) newIndex = itemsLength - 1; // last
			else if (action === "UP" && selectedIndex === 0) return;
			else if (action === "UP") newIndex = selectedIndex - 1;
			else if (action === "DOWN" && selectedIndexNotValid) newIndex = 0; // first
			else if (action === "DOWN" && selectedIndex === itemsLength - 1) return;
			else if (action === "DOWN") newIndex = selectedIndex + 1;
			else return;
			const id = itemsRef[newIndex].id ?? null;
			logic.requestChangeSelectedItemById(id);
		} else if (action === "LEFT") {
			if (category == "weekly") {
				if (ltr) logic.requestWeekChange(-1); else logic.requestWeekChange(+1);
			}
		} else if (action === "RIGHT") {
			if (category == "weekly") {
				if (ltr) logic.requestWeekChange(+1); else logic.requestWeekChange(-1);
			}
		} else if (action === "MOVE_UP") {
			if (selectedItem) logic.requestMoveItemUpOrDown(selectedItem, -1);
		} else if (action === "MOVE_DOWN") {
			if (selectedItem) logic.requestMoveItemUpOrDown(selectedItem, +1);
		} else if (action === "MOVE_LEFT") {
			if (!selectedItem) return;
			if (ltr) logic.moveItemScheduleTimeByWeeks(selectedItem, -1)
			else logic.moveItemScheduleTimeByWeeks(selectedItem, +1)
		} else if (action === "MOVE_RIGHT") {
			if (!selectedItem) return;
			if (ltr) logic.moveItemScheduleTimeByWeeks(selectedItem, +1)
			else logic.moveItemScheduleTimeByWeeks(selectedItem, -1)
		} else if (action === "DELETE") {
			if (selectedItem) logic.requestDeleteItem(selectedItem);
		} else if (action === "EDIT_START") {
			if (selectedItem) logic.requestBeginEditingExistingItem(selectedItem, "caret_start");
		} else if (action === "EDIT_END") {
			if (selectedItem) logic.requestBeginEditingExistingItem(selectedItem, "caret_end");
		} else if (action === "EDIT_SELECT_ALL") {
			if (selectedItem) logic.requestBeginEditingExistingItem(selectedItem, "caret_select_all");
		} else if (action === "COPY") {
			if (selectedItem) logic.requestCopyItem(selectedItem);
		} else if (action === "PASTE") {
			if (selectedIndex >= 0) logic.requestPasteAtIndex(selectedIndex);
			else logic.requestPasteAtIndex(itemsLength);
		} else if (action === "PASTE_ABOVE") {
			if (selectedIndex >= 0) logic.requestPasteAtIndex(selectedIndex - 1);
			else logic.requestPasteAtIndex(-1);
		} else if (action === "COPY_ALL_ITEMS_TEXT") {
			// todo: copy all the items in the list as a single text to clipboard
			console.log("todo! not implemented yet!");
		} else if (action === "TOGGLE_STATUS") {
			if (selectedItem) logic.requestToggleItemStatus(selectedItem);
		} else if (action === "TOGGLE_TYPE") {
			if (selectedItem) logic.requestToggleItemType(selectedItem);
		} else if (action === "CANCEL") {
			logic.requestCancelWhateverIsHappening();
		} else if (action === "CREATE") {
			if (selectedIndexNotValid) logic.requestBeginEditingNewItem(itemsLength, itemsLength + 1);
			else logic.requestBeginEditingNewItem(selectedIndex, selectedIndex + 1);
		} else if (action === "CREATE_ABOVE") {
			logic.requestBeginEditingNewItem(selectedIndex, selectedIndex - 1);
		} else if (action === "TODO") {
			console.log("empty test todo!");
		} else {
			console.log("ERROR! not a valid action call! or not implemented!! action:", action);
		}
		return;
	},
}));
