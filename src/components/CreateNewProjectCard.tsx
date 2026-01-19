import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useAppLogic } from "@/store/appLogic";

export function CreateNewProjectCard() {
  const requestCreateNewProject = useAppLogic((state) => state.requestCreateNewProject);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && newProjectTitle.trim() !== "") {
      requestCreateNewProject(newProjectTitle);
      console.log("applyed");
    } else if (event.key === 'Escape') {
      requestCreateNewProject(null);
      console.log("cancel");
    } else { }
  }

  return (
    <Card className="bg-card p-1 gap-0">
      <CardHeader className="p-0">
        <CardTitle hidden>Project/List Title?</CardTitle>
        <CardDescription hidden>
          Project or List Name?
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1">
        <div className="flex flex-col justify-start items-start gap-2">
          <p>Project or List Name?</p>
          <Input placeholder="my new project..." autoFocus
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2">
            <Button
              variant={"outline"}
              onClick={() => {
                if (newProjectTitle.trim() === "") return;
                requestCreateNewProject(newProjectTitle.trim());
                console.log("apply")
              }}>
              OK
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => {
                requestCreateNewProject(null);
                console.log("cancel")
              }}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card >
  );
}
