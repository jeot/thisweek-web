import { async_savePartialAppConfig, AppConfig } from '@/lib/appConfigDb';
import { PageViewType } from '@/types/types';
import { create } from 'zustand';

type OtherConfigs = {
	currentPage: PageViewType;
	currentProject: string | null;
	sidebarCollapsed: boolean;
	setOtherConfigs: (config: AppConfig, save?: boolean) => void;
	setCurrentPage: (page: PageViewType, save?: boolean) => void;
	setCurrentProject: (proj: string | null, save?: boolean) => void;
	setSidebarCollapsed: (v: boolean, save?: boolean) => void;
};

export const useOtherConfigs = create<OtherConfigs>((set) => ({
	currentPage: "This Week",
	currentProject: null,
	sidebarCollapsed: true,
	setOtherConfigs: (config: AppConfig, save?: boolean) => {
		set({ currentPage: config.currentPage, currentProject: config.currentProject, sidebarCollapsed: config.sidebarCollapsed });
		if (save) async_savePartialAppConfig({ currentPage: config.currentPage, currentProject: config.currentProject, sidebarCollapsed: config.sidebarCollapsed });
	},
	setCurrentPage: (page, save = true) => {
		set({ currentPage: page });
		if (save) async_savePartialAppConfig({ currentPage: page });
	},
	setCurrentProject: (proj, save = true) => {
		set({ currentProject: proj });
		if (save) async_savePartialAppConfig({ currentProject: proj });
	},
	setSidebarCollapsed: (v, save = true) => {
		set({ sidebarCollapsed: v });
		if (save) async_savePartialAppConfig({ sidebarCollapsed: v });
	},
}));



