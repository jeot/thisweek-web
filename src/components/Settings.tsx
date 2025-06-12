import { lorem } from "@/assets/lorem";
import { Button } from "./ui/button";
import { useSettingsState, SettingPageType } from "@/store/settingsStore";
import { SettingsCalendar } from "@/components/SettingsCalendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Settings() {
  const settingPage = useSettingsState((state) => state.settingPage);
  const setSettingPage = useSettingsState((state) => state.setSettingPage);

  function handleTabChange(x: string) {
    console.log(x)
    setSettingPage(x as SettingPageType)
  }

  const SettingsGeneral = () => <div><h1>General!</h1><p>{lorem}</p></div>;
  const SettingsKeymap = () => <div><h1>Keymaps!</h1><p>{lorem}</p></div>;

  const settings: Array<{ name: SettingPageType, child: () => JSX.Element }> = [
    { name: "General", child: SettingsGeneral },
    { name: "Calendars", child: SettingsCalendar },
    { name: "Keybinds", child: SettingsKeymap },
  ];
  const SettingContent = settings.find((v) => { return (v.name === settingPage) })?.child!;

  return (
    <div className="h-full">
      <Tabs value={settingPage} className="w-full sm:hidden p-4" onValueChange={handleTabChange}>
        <TabsList className="w-full">
          {settings.map((v) => {
            return (
              <TabsTrigger value={v.name} className="hover:bg-primary/5 m-1">{v.name}</TabsTrigger>
            );
          })}
        </TabsList>
        {settings.map((v) => {
          const Content = v.child;
          return (
            <TabsContent value={v.name}><Content /></TabsContent>
          );
        })}
      </Tabs>

      <div className="flex flex-row justify-self-stretch h-full hidden sm:flex">
        <div className="flex-1 p-4 min-w-32 max-w-48 bg-sidebar flex flex-col gap-2">
          {settings.map((v) => {
            const variant = settingPage === v.name ? "default" : "shk";
            return (
              <Button className="text-base" variant={variant} onClick={() => { handleTabChange(v.name) }}>{v.name}</Button>
            );
          })}
        </div>
        <div className="flex-3 p-4 min-w-sm overflow-y-auto">
          <SettingContent />
        </div>
      </div>
    </div >
  );
}
