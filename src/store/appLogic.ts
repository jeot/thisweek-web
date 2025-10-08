import { ItemType, PageViewType } from '@/types/types';
import { create } from 'zustand';
import { async_saveDraftItem, async_deleteDraftItem, async_deleteItemSoft, async_saveAsNewItem, async_saveItem, createNewItem, getNewOrderingNumber } from '@/lib/items';
import { Action } from '@/types/types';
import { useCalendarConfig } from './calendarConfig';
import { useThemeConfig } from './themeConfig';
import { timeToISO } from '@/lib/utils';
import { useDataSyncStore } from './dataSyncStore';

export type SettingPageType = 'General' | 'Calendars' | 'Keymaps' | 'About';
export type LoginInfoModalType = 'login' | 'sign-up' | 'forgot-password' | 'logged-in' | 'update-password' | null;

type AppLogic = {
	// ui
	showLoginInfoModal: LoginInfoModalType;
	setShowLoginInfoModal: (t: LoginInfoModalType) => void;
	pageView: PageViewType;
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
	editingNewItem: ItemType | null;
	editingExistingItem: ItemType | null;
	unsyncedItemsCount: number;
	setWeeklyItemsForced: (items: ItemType[]) => void;
	setProjectItemsForced: (items: ItemType[]) => void;
	setEditingNewItemsForced: (item: ItemType | null) => void;
	setEditingExistingItemsForced: (item: ItemType | null) => void;
	setUnsyncedItemsCount: (count: number) => void;

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
	requestBeginEditingNewItem: (firstIndex: number, secondIndex: number, category?: 'weekly' | 'project') => void;
	requestBeginEditingExistingItem: (item: ItemType, caretPosition?: 'caret_start' | 'caret_end' | 'caret_select_all') => void;
	moveItemScheduleTimeByWeeks: (item: ItemType, weekOffset: number, follow?: boolean, select?: boolean) => void;
	moveItemScheduleTimeToThisWeek: (item: ItemType, weekOffset?: number, follow?: boolean, select?: boolean) => void;
	requestGoToToday: () => void;
	requestWeekChange: (weekOffset: number) => void;
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
	eventItemWasClicked: (item: ItemType) => void;
	eventItemContextMenuOpened: (item: ItemType) => void;

	// actions (keyboard mostly or events)
	actionRequest: (action: Action) => void,
};

export const useAppLogic = create<AppLogic>((set, get) => ({
	showLoginInfoModal: null,
	setShowLoginInfoModal: (t) => set({ showLoginInfoModal: t }),
	pageView: 'This Week',
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
	editingNewItem: null,
	editingExistingItem: null,
	editingCaretPosition: null,
	unsyncedItemsCount: 0,
	setWeeklyItemsForced: (items) => set({ weeklyItems: items }),
	setProjectItemsForced: (items) => set({ projectItems: items }),
	setEditingNewItemsForced: (item) => {
		set({ editingNewItem: item });
		if (item) set({ weekReference: item.scheduledAt });
	},
	setEditingExistingItemsForced: (item) => {
		set({ editingExistingItem: item });
		if (item) set({ weekReference: item.scheduledAt });
	},
	setUnsyncedItemsCount: (count: number) => set({ unsyncedItemsCount: count }),

	// helper functions

	findItemInList: (item) => {
		const logic = get();
		return (logic.weeklyItems.find((i) => (i.id === item.id && i.uuid === item.uuid)) || null);
	},
	findItemIndex: (item) => {
		const logic = get();
		const index = logic.weeklyItems.findIndex((i) => (i.id === item.id && i.uuid === item.uuid));
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
		const originalItemTitle = logic.weeklyItems.find((i) => (i.id === logic.editingExistingItem?.id))?.title;
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
		set({ pageView: page });
	},
	requestSettingPageChange: (page: SettingPageType) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		if (logic.pageView === 'Settings') set({ settingPage: page });
	},
	requestBeginEditingNewItem: (firstIndex, secondIndex, category = 'weekly') => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const ordering = getNewOrderingNumber(logic.weeklyItems, firstIndex, secondIndex, category);
		const newItem = createNewItem(ordering, category);
		logic.setEditingNewItemsForced(newItem);
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
	requestChangeSelectedItemById: (id) => {
		const logic = get();
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		set({ selectedId: id });
	},
	requestMoveItemUpOrDown: (item: ItemType, offset: number) => {
		const logic = get();
		if (!logic.findItemInList(item)) return;
		if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
		const index = logic.findItemIndex(item); if (index === null) return;
		console.log("⬆️⬇️");
		const nextOffset = offset >= 0 ? offset + 1 : offset - 1;
		const newOrder = getNewOrderingNumber(logic.weeklyItems, index + offset, index + nextOffset, "weekly")
		item.ordering = { ...item.ordering, weekly: newOrder };
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
			.then((text) => {
				console.log("pasting text: ", text);
				if (text.trim().length == 0) {
					console.log("no text to paste. ignored");
					return;
				}
				// some more code...
				const logic = get();
				if (!logic.easyCheckForCancelingUnchangedEditingItemOrWiggle()) return;
				const normalize = (str: string) => str.replace(/\r\n/g, '\n');
				const internalCopy = (logic.internalCopiedItem && (normalize(text) === normalize(logic.internalCopiedItem.title))) || false;
				const newItemPosition = getNewOrderingNumber(logic.weeklyItems, index, index + 1, "weekly")
				if (internalCopy && logic.internalCopiedItem) {
					let newItem = logic.internalCopiedItem;
					newItem.category = "weekly";
					newItem.ordering = { ...newItem.ordering, weekly: newItemPosition };
					newItem.scheduledAt = logic.weekReference;
					async_saveAsNewItem(newItem)
						.then((id) => {
							if (id === null) return;
							set({ selectedId: id });
						})
						.catch((err) => console.log("err:", err));
				} else if (!internalCopy) {
					let newItem = createNewItem();
					newItem.title = text;
					newItem.category = "weekly";
					newItem.ordering = { ...newItem.ordering, weekly: newItemPosition };
					newItem.scheduledAt = logic.weekReference;
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
		} else {
			console.log("error! should not happen!");
		}
	},

	// some events from components
	eventWeekPageClicked: () => {
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
		const itemsLength = logic.weeklyItems.length || 0;
		const selectedIndex: number = logic.weeklyItems.findIndex((item) => (item.id === logic.selectedId));
		const selectedIndexNotValid = ((selectedIndex < 0) || (selectedIndex >= itemsLength));
		const selectedItem = logic.weeklyItems.find((item) => (item.id === logic.selectedId)) || null;
		if (!action) {
		} else if (action === "TODAY") {
			logic.requestGoToToday();
		} else if (action === "UP" || action === "DOWN") {
			let newIndex = 0;
			if (action === "UP" && selectedIndexNotValid) newIndex = itemsLength - 1; // last
			else if (action === "UP" && selectedIndex === 0) return;
			else if (action === "UP") newIndex = selectedIndex - 1;
			else if (action === "DOWN" && selectedIndexNotValid) newIndex = 0; // first
			else if (action === "DOWN" && selectedIndex === itemsLength - 1) return;
			else if (action === "DOWN") newIndex = selectedIndex + 1;
			else return;
			const id = logic.weeklyItems[newIndex].id ?? null;
			logic.requestChangeSelectedItemById(id);
		} else if (action === "LEFT") {
			if (ltr) logic.requestWeekChange(-1); else logic.requestWeekChange(+1);
		} else if (action === "RIGHT") {
			if (ltr) logic.requestWeekChange(+1); else logic.requestWeekChange(-1);
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
