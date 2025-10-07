import { runSync } from '@/lib/sync';
import { create } from 'zustand'

type SyncStateType = 'idle' | 'fetching' | 'pushing' | 'success' | 'error' | null;

type DataSyncState = {
	syncing: boolean;
	syncState: SyncStateType;
	setSyncState: (syncState: SyncStateType) => void;
	startSync: () => void;
	/* for future realtime fetching...
	connectRealtime: () => void;
	applyRealtimeChange: (payload) => void;
	*/
}

export const useDataSyncStore = create<DataSyncState>((set, get) => ({
	syncing: false,
	syncState: null,
	setSyncState: (syncState: SyncStateType) => {
		set({ syncState });
	},
	startSync: () => {
		if (get().syncing) {
			console.log("Sync already in progress, skipping...");
			return;
		}
		set({ syncing: true });
		runSync()
			.then(() => {
				set({ syncing: false });
			})
			.catch((e) => {
				console.error("sync err: ", e);
				set({ syncing: false });
			})
			.finally(() => {
				set({ syncing: false });
			})
	},

	/* for future realtime fetching...
	connectRealtime: () => {
		if (get().channel) return;
		const channel = supabase.channel("public:items")
			.on('postgres_changes', { event: '*', schema: 'public', table: 'items' },
				payload => get().applyRealtimeChange(payload))
			.subscribe();
		set({ channel });
	},
	applyRealtimeChange: (payload) => {
		// merge payload into local DB
	},
	*/
}));


