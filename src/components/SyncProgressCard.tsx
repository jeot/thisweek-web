// import { PauseIcon, PlayIcon } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { CloudSyncIcon } from "./CloudSyncIcon";
import { Button } from "./ui/button";
import { useDataSyncStore } from "@/store/dataSyncStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function SyncProgressCard() {
  const startSync = useDataSyncStore((state) => state.startSync);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Syncing Progress</CardTitle>
        <CardDescription>
          The cloud syncing progress is shown here.<br />
          You can run sync manually too.
          {/* note: maybe for the future: */}
          {/*You can Pause/Resume or run sync manually here.*/}
        </CardDescription>
        {/* note: maybe for the future:
        <CardAction>
          <Button variant={"secondary"} onClick={() => { }}>
            <PauseIcon />
            <PlayIcon />
          </Button>
        </CardAction>
        */}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <CloudSyncIcon displayText />
          <Button variant={"secondary"} onClick={startSync}>
            <RefreshCw className="text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card >
  );
}
