import { create } from 'zustand';

type ListState = {
	selectedId: number | null;
	setSelectedId: (id: number | null) => void;
};

export const useListState = create<ListState>((set) => ({
	selectedId: null,
	setSelectedId: (id) => set({ selectedId: id }),
}));


