import { ItemType, PageViewType } from '@/types/types';
import { create } from 'zustand';
import { MILLISECONDS_IN_WEEK } from '@/lib/week';
import { createExistingEditingItem, createNewEditingItem, deleteItem, getNewOrderingNumber, updateItem, saveAsNewItem, createNewItem, cancelEditingItem, applyEditingItem } from '@/lib/items';
import { Action } from '@/types/types';
import { useCalendarConfig } from './calendarConfig';
import { useThemeConfig } from './themeConfig';

export type SettingPageType = 'General' | 'Calendars' | 'Keymaps' | 'About';

type AppLogic = {
	// ui
	pageView: PageViewType;
	settingPage: SettingPageType;
	weekReference: number;
	internalCopiedItem: ItemType | null;
	selectedId: number | null;
	editingCaretPosition: 'caret_start' | 'caret_end' | 'caret_select_all' | null;

	// data
	weeklyItems: ItemType[];
	projectItems: ItemType[];
	editingNewItem: ItemType | null;
	editingExistingItem: ItemType | null;
	setWeeklyItems: (items: ItemType[]) => void;
	setProjectItems: (items: ItemType[]) => void;
	setEditingNewItems: (item: ItemType | null) => void;
	setEditingExistingItems: (item: ItemType | null) => void;

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
	requestApplyEditingItem: (item: ItemType) => Promise<void>;
	requestCancelEditingItem: (item: ItemType) => Promise<void>;
	requestCopyItemAsync: (item: ItemType) => Promise<void>;
	requestPasteAtItemAsync: (item: ItemType) => Promise<void>;
	requestPasteAtIndexAsync: (index: number) => Promise<void>;
	requestToggleItemStatus: (item: ItemType) => void;
	requestToggleItemType: (item: ItemType) => void;
	requestCancelWhateverIsHappening: () => void;

	// actions (keyboard mostly or events)
	actionRequest: (action: Action) => void,
};

export const useAppLogic = create<AppLogic>((set, get) => ({
	pageView: 'This Week',
	settingPage: 'Calendars',
	weekReference: (new Date()).getTime(),
	internalCopiedItem: null,
	selectedId: null,

	weeklyItems: [],
	projectItems: [],
	editingNewItem: null,
	editingExistingItem: null,
	editingCaretPosition: null,
	setWeeklyItems: (items) => set({ weeklyItems: items }),
	setProjectItems: (items) => set({ projectItems: items }),
	setEditingNewItems: (item) => {
		set({ editingNewItem: item });
		if (item) set({ weekReference: item.scheduledAt });
	},
	setEditingExistingItems: (item) => {
		set({ editingExistingItem: item });
		if (item) set({ weekReference: item.scheduledAt });
	},

	requestPageViewChange: (page) => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		set({ pageView: page });
	},
	requestSettingPageChange: (page: SettingPageType) => {
		const logic = get();
		if (logic.pageView === 'Settings') set({ settingPage: page });
	},
	requestBeginEditingNewItem: (firstIndex, secondIndex, category = 'weekly') => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		const ordering = getNewOrderingNumber(logic.weeklyItems, firstIndex, secondIndex, category);
		createNewEditingItem(ordering);
	},
	requestBeginEditingExistingItem: (item, caretPosition = 'caret_end') => {
		if (get().editingExistingItem || get().editingNewItem) return;
		createExistingEditingItem(item);
		set({ editingCaretPosition: caretPosition });
	},
	moveItemScheduleTimeByWeeks: (item, weekOffset, follow = true, select = true) => {
		if (get().editingExistingItem || get().editingNewItem) return;
		const newSchedule = item.scheduledAt + (weekOffset * MILLISECONDS_IN_WEEK);
		updateItem({ ...item, scheduledAt: newSchedule, });
		if (follow) set({ weekReference: newSchedule });
		if (select) set({ selectedId: item.id });
	},
	moveItemScheduleTimeToThisWeek: (item, weekOffset = 0, follow = true, select = true) => {
		if (get().editingExistingItem || get().editingNewItem) return;
		const newSchedule = (new Date()).getTime() + (weekOffset * MILLISECONDS_IN_WEEK);
		updateItem({ ...item, scheduledAt: newSchedule, });
		if (follow) set({ weekReference: newSchedule });
		if (select) set({ selectedId: item.id });
	},
	requestGoToToday: () => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		set({ weekReference: (new Date()).getTime() });
		return true;
	},
	requestWeekChange: (weekOffset) => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		set({ weekReference: logic.weekReference + (weekOffset * MILLISECONDS_IN_WEEK) })
		set({ selectedId: null });
	},
	requestChangeSelectedItemById: (id) => {
		if (get().editingExistingItem || get().editingNewItem) return;
		set({ selectedId: id });
	},
	requestMoveItemUpOrDown: (item: ItemType, offset: number) => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		const itemIndex: number = logic.weeklyItems.findIndex((i) => (i.id === item.id));
		if (itemIndex < 0) return;
		console.log("⬆️⬇️");
		const nextOffset = offset >= 0 ? offset + 1 : offset - 1;
		const newOrder = getNewOrderingNumber(logic.weeklyItems, itemIndex + offset, itemIndex + nextOffset, "weekly")
		updateItem({ ...item, order: { ...item.order, weekly: newOrder } });
	},
	requestDeleteItem: (item: ItemType) => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		const itemIndex: number = logic.weeklyItems.findIndex((i) => (i.id === item.id));
		if (itemIndex < 0) return;
		deleteItem(item);
	},
	requestUpdateItem: (item: ItemType) => {
		const logic = get();
		const itemIndex: number = logic.weeklyItems.findIndex((i) => (i.id === item.id));
		if (!logic.editingExistingItem && !logic.editingNewItem && (itemIndex < 0)) return;
		updateItem(item);
	},
	requestApplyEditingItem: async (item: ItemType) => {
		const logic = get();
		const itemIndex: number = logic.weeklyItems.findIndex((i) => (i.id === item.id));
		if (!logic.editingExistingItem && !logic.editingNewItem && (itemIndex < 0)) return;
		const id = await applyEditingItem(item);
		set({ selectedId: id });
	},
	requestCancelEditingItem: async (item: ItemType) => {
		const logic = get();
		const itemIndex: number = logic.weeklyItems.findIndex((i) => (i.id === item.id));
		if (!logic.editingExistingItem && !logic.editingNewItem && (itemIndex < 0)) return;
		cancelEditingItem(item);
	},
	requestCopyItemAsync: async (item: ItemType) => {
		navigator.clipboard.writeText(item.title)
			.then(() => { console.log("write to clipboard done."); })
			.catch((err) => { console.log("write to clipboard failed. err:", err); });
		set({ internalCopiedItem: item });
		console.log("internal copy done.");
	},
	requestPasteAtItemAsync: async (item: ItemType) => {
		const logic = get();
		const itemIndex: number = logic.weeklyItems.findIndex((i) => (i.id === item.id));
		await logic.requestPasteAtIndexAsync(itemIndex);
	},
	requestPasteAtIndexAsync: async (index: number) => {
		const logic = get();
		if (logic.editingExistingItem || logic.editingNewItem) return;
		try {
			console.log("trying to get the text from clipboard...");
			// const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
			// console.log("permission: ", result.state); // 'granted', 'denied', or 'prompt'
			let text = await navigator.clipboard.readText();
			console.log("pasting text: ", text);
			if (text.trim().length == 0) {
				console.log("no text value for paste available. ignored");
				return;
			}

			/*
			 * the test for debugging the issue with copy/paste!
			 * windows replaces the \n with \r\n
			 * that's why we use the normalize function bellow
			 */
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

			const normalize = (str: string) => str.replace(/\r\n/g, '\n');
			const internalCopy = (logic.internalCopiedItem && (normalize(text) === normalize(logic.internalCopiedItem.title))) || false;

			const newItemPosition = getNewOrderingNumber(logic.weeklyItems, index, index + 1, "weekly")
			if (internalCopy && logic.internalCopiedItem) {
				let newItem = logic.internalCopiedItem;
				newItem.category = "weekly";
				newItem.order["weekly"] = newItemPosition;
				newItem.scheduledAt = logic.weekReference;
				newItem.deletedAt = null;
				saveAsNewItem(newItem).then((id) => set({ selectedId: id }))
			} else if (!internalCopy) {
				let newItem = createNewItem(newItemPosition);
				newItem.title = text;
				saveAsNewItem(newItem).then((id) => set({ selectedId: id }))
			} else {
			}
		} catch (err) {
			const log = `Error: trying to paste: ${err}`;
			console.log(log);
		}
	},
	requestToggleItemStatus: (item: ItemType) => {
		const newStatus = item.status === 'done' ? 'undone' : 'done';
		updateItem({ ...item, status: newStatus });
	},
	requestToggleItemType: (item: ItemType) => {
		const type = (item.type === 'todo') ? 'note' : 'todo';
		updateItem({ ...item, type: type });
	},
	requestCancelWhateverIsHappening: () => {
		const logic = get();
		if (logic.editingExistingItem) {
			cancelEditingItem(logic.editingExistingItem);
		} else if (logic.editingNewItem) {
			cancelEditingItem(logic.editingNewItem);
		} else if (logic.selectedId !== null) {
			set({ selectedId: null });
		} else {
		}
	},

	// actions (keyboard mostly or events)
	// most of the actions is performed on selectedItem
	actionRequest: (action: Action) => {
		console.log("new action: ", action);
		const logic = get();
		const ltr = (useCalendarConfig.getState().mainCal.locale.direction === 'ltr');
		const itemsLength = logic.weeklyItems.length || 0;
		const selectedIndex: number = logic.weeklyItems.findIndex((item) => (item.id === logic.selectedId));
		const selectedIndexNotValid = ((selectedIndex < 0) || (selectedIndex >= itemsLength));
		const selectedItem = selectedIndexNotValid ? null : logic.weeklyItems[selectedIndex];
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
			if (selectedItem) logic.requestCopyItemAsync(selectedItem);
		} else if (action === "PASTE") {
			if (selectedIndex >= 0) logic.requestPasteAtIndexAsync(selectedIndex);
			else logic.requestPasteAtIndexAsync(itemsLength);
		} else if (action === "PASTE_ABOVE") {
			if (selectedIndex >= 0) logic.requestPasteAtIndexAsync(selectedIndex - 1);
			else logic.requestPasteAtIndexAsync(-1);
		} else if (action === "COPY_ALL_ITEMS_TEXT") {
			// todo: copy all the items in the list as a single text to clipboard
			console.log("todo! not implemented yet!");
		} else if (action === "TOGGLE_THEME") {
			useThemeConfig.getState().toggleTheme();
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


