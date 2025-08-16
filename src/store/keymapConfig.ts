import { create } from 'zustand';
import { saveAppConfigToIDBPartial } from '@/lib/appConfigDb';

interface KeymapType {
	generalShortcutsEnabled: boolean;
	vimModeShortcutsEnabled: boolean;
	mappings?: Record<string, string>;
};


type KeymapsConfig = {
	keymap: KeymapType;
	setKeymap: (value: KeymapType, save?: boolean) => void;
};

export const useKeymapsConfig = create<KeymapsConfig>((set) => ({
	keymap: {
		generalShortcutsEnabled: true,
		vimModeShortcutsEnabled: false,
		mappings: undefined
	},
	setKeymap: (value, save = true) => {
		set({ keymap: value });
		if (save) saveAppConfigToIDBPartial({ keymap: value });
	}
}));

