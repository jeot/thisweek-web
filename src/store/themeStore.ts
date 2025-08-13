import { saveAppConfigToIDBPartial } from '@/lib/appConfigDb';
import { create } from 'zustand';

interface ThemeType {
	mode: 'light' | 'dark';
	custom?: {
		font?: string;
		size?: string;
		colorScheme: string;
	};
};

type ThemeState = {
	theme: ThemeType;
	setTheme: (t: ThemeType, save?: boolean) => void;
	toggleTheme: () => void,
};

export const useThemeState = create<ThemeState>((set, get) => ({
	theme: { mode: 'dark', custom: undefined },
	setTheme: (t, save = true) => {
		set({ theme: t });
		if (save) saveAppConfigToIDBPartial({ theme: t });
	},
	toggleTheme: () => {
		const current = get().theme;
		if (current.mode === 'dark') get().setTheme({ ...current, mode: 'light' });
		if (current.mode === 'light') get().setTheme({ ...current, mode: 'dark' });
	}
}));


