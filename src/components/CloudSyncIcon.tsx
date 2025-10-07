import { CloudAlert, CloudDownload, CloudIcon, CloudOffIcon, CloudUpload, CloudCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useDataSyncStore } from "@/store/dataSyncStore";

export const CloudSyncIcon = ({ displayText }: { displayText?: boolean }) => {
  const session = useAuthStore((state) => state.session);
  const syncState = useDataSyncStore((state) => state.syncState);
  const errorMessage = useDataSyncStore((state) => state.errorMessage);

  return (
    <div className="flex gap-2">
      {session !== null && syncState === "idle" && <CloudIcon className="text-green-600" />}
      {session !== null && syncState === "fetching" && <CloudDownload className="text-green-600" />}
      {session !== null && syncState === "pushing" && <CloudUpload className="text-green-600" />}
      {session !== null && syncState === "success" && <CloudCheck className="text-green-600" />}
      {session !== null && syncState === "error" && <CloudAlert className="text-orange-600" />}
      {session === null && <CloudOffIcon className="text-gray-500" />}

      {displayText && session !== null && syncState === "idle" && <span>Initializing...</span>}
      {displayText && session !== null && syncState === "fetching" && <span>Syncing from cloud...</span>}
      {displayText && session !== null && syncState === "pushing" && <span>Uploading changes...</span>}
      {displayText && session !== null && syncState === "success" && <span>All synced</span>}
      {displayText && session !== null && syncState === "error" && <span>Sync failed - {errorMessage}</span>}
      {displayText && session === null && <span>Offline</span>}
    </div>
  );
}

