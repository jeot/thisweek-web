import { runSync } from '@/lib/sync';
import { create } from 'zustand'

export type SyncStateType = 'idle' | 'fetching' | 'pushing' | 'success' | 'error';

type DataSyncState = {
	syncing: boolean;
	syncState: SyncStateType;
	errorMessage: string | null;
	setSyncState: (syncState: SyncStateType) => void;
	startSync: () => void;
	/* for future realtime fetching...
	connectRealtime: () => void;
	applyRealtimeChange: (payload) => void;
	*/
}

export const useDataSyncStore = create<DataSyncState>((set, get) => ({
	syncing: false,
	syncState: 'idle',
	errorMessage: null,
	setSyncState: (syncState: SyncStateType, errorMessage?: string | null) => {
		const e = errorMessage ? errorMessage : null;
		set({ syncState, errorMessage: e });
	},
	startSync: () => {
		if (get().syncing) {
			console.log("Sync already in progress, skipping...");
			return;
		}
		set({ syncing: true, errorMessage: null });
		runSync()
			.then(() => {
				set({ syncing: false, errorMessage: null });
			})
			.catch((err) => {
				console.error("sync err: ", err);
				let reason = "Unknown error";

				if (!navigator.onLine) {
					reason = "No network connection";
				} else if (err?.message?.includes("Failed to fetch")) {
					reason = "No network connection";
				} else if (err?.message?.includes("Auth error!")) {
					reason = "Authentication failed";
				} else if (err?.message?.includes("timeout")) {
					reason = "Connection timed out";
				} else if (err?.message?.includes("Unauthorized")) {
					reason = "Authentication failed";
				} else if (err?.message) {
					reason = err.message;
				}
				set({ syncing: false, syncState: 'error', errorMessage: reason });
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


