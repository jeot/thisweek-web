import { AuthPanel } from "./AuthPanel";
// import { useAppState } from "@/store/appStore";

export function SettingsSync() {

  // const session = useAppState((state) => state.session);
  // const syncEnabled = false;
  // function setSyncEnabled() { }
  return (
    <div className="flex flex-col items-stretch gap-3 max-w-md">
      <div className="flex items-baseline space-x-5">
        <h2 className="mt-2">Cloud Syncing &nbsp; ☁️</h2>
        {/* i don't get this switch yet! */}
        {/*<Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />*/}
      </div>

      <p className="text-sm">To enable cloud syncing, please log in to your account. Once logged in, your data will be automatically backed up and synced across your devices.
        Logging out will stop syncing, but your data will remain available for offline use on this device.</p>

      <AuthPanel />
    </div>
  );
}

