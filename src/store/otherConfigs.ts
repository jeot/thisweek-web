import { saveAppConfigToIDBPartial } from '@/lib/appConfigDb';
import { create } from 'zustand';

type OtherConfigs = {
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (v: boolean, save?: boolean) => void;
};

export const useOtherConfigs = create<OtherConfigs>((set) => ({
	sidebarCollapsed: true,
	setSidebarCollapsed: (v, save = true) => {
		set({ sidebarCollapsed: v });
		if (save) saveAppConfigToIDBPartial({ sidebarCollapsed: v });
	},
}));



