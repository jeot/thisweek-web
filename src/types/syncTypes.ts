export interface SyncableEntity {
  uuid: string;
  userId: string | null;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
  version: number;
  syncedAt: string | null;
  modifiedBy: string;
}

export interface SyncRemoteRow {
  uuid: string;
  user_id: string | null;
  created_at: string;
  modified_at: string;
  deleted_at: string | null;
  version: number;
  synced_at: string;
  modified_by: string;
}

export type SyncTableKey = "projects" | "items" | (string & {});
