import { create } from 'zustand';

export type SettingPageType = 'General' | 'Calendars' | 'Keybinds';

type SettingsState = {
	settingPage: SettingPageType;
	setSettingPage: (p: SettingPageType) => void;
};

export const useSettingsState = create<SettingsState>((set) => ({
	settingPage: 'Calendars',
	setSettingPage: (p) => set({ settingPage: p }),
}));

