import { lorem } from "@/assets/lorem";
import { Button } from "./ui/button";
import { SettingsCalendar } from "@/components/SettingsCalendar"
import { SettingsKeymap } from "@/components/SettingsKeymap"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingPageType, useAppState } from "@/store/appStore";
import { SettingsAbout } from "./SettingsAbout";

export function SettingsPage() {
  const settingPage = useAppState((state) => state.settingPage);
  const setSettingPage = useAppState((state) => state.setSettingPage);

  function handleTabChange(x: string) {
    console.log(x)
    setSettingPage(x as SettingPageType)
  }

  const SettingsGeneral = () => <div><h1>General!</h1><p>{lorem}</p></div>;

  const settings: Array<{ name: SettingPageType, child: () => JSX.Element, hidden?: boolean }> = [
    { name: "General", child: SettingsGeneral, hidden: true },
    { name: "Calendars", child: SettingsCalendar },
    { name: "Keymaps", child: SettingsKeymap },
    { name: "About", child: SettingsAbout },
  ];
  const SettingContent = settings.find((v) => { return (v.name === settingPage) })?.child!;

  return (
    <div className="h-full">
      <Tabs value={settingPage} className="w-full sm:hidden p-2" onValueChange={handleTabChange}>
        <TabsList className="w-full gap-1">
          {settings.filter((v) => !v.hidden).map((v) => {
            return (
              <TabsTrigger key={v.name} value={v.name} className="hover:bg-primary/5">{v.name}</TabsTrigger>
            );
          })}
        </TabsList>
        {settings.filter((v) => !v.hidden).map((v) => {
          const Content = v.child;
          return (
            <TabsContent key={v.name} value={v.name}><Content /></TabsContent>
          );
        })}
      </Tabs>

      <div className="flex flex-row justify-self-stretch h-full hidden sm:flex">
        <div className="flex-1 p-4 min-w-32 max-w-48 bg-sidebar flex flex-col gap-2">
          {settings.filter((v) => !v.hidden).map((v) => {
            const variant = settingPage === v.name ? "default" : "shk";
            return (
              <Button key={v.name} className="text-base" variant={variant} onClick={() => { handleTabChange(v.name) }}>{v.name}</Button>
            );
          })}
        </div>
        <div className="flex-3 p-4 w-1 overflow-y-auto">
          <SettingContent />
        </div>
      </div>
    </div >
  );
}
