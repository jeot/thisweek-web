import { lorem } from "@/assets/lorem";
import { Button } from "./ui/button";
import { SettingsCalendar } from "@/components/SettingsCalendar"
import { SettingsKeymap } from "@/components/SettingsKeymap"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingPageType, useAppState } from "@/store/appStore";
import { SettingsAbout } from "./SettingsAbout";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useEffect, useRef } from "react";

export function SettingsPage() {
  const settingPage = useAppState((state) => state.settingPage);
  const setSettingPage = useAppState((state) => state.setSettingPage);
  const isWideScreen = useMediaQuery("(min-width: 40rem)"); // tailwindcss defines 640px as 40rem
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleTabChange(x: string) {
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


  // todo: scroll to top don't work in tabs mode.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [settingPage]); // depends on settingPage change

  if (isWideScreen)
    return (
      <div className="flex flex-row justify-self-stretch h-full">
        <div className="flex-1 p-4 min-w-32 max-w-48 bg-sidebar flex flex-col gap-2">
          {settings.filter((v) => !v.hidden).map((v) => {
            const variant = settingPage === v.name ? "default" : "shk";
            return (
              <Button key={v.name} className="text-base" variant={variant} onClick={() => { handleTabChange(v.name) }}>{v.name}</Button>
            );
          })}
          <p className="mt-auto text-xs text-muted-foreground text-center">
            &nbsp;v{__APP_VERSION__}
          </p>
        </div>
        <div
          ref={scrollRef}
          className="flex-3 p-4 w-1 overflow-y-auto">
          <SettingContent />
        </div>
      </div>)
  else
    return (
      <Tabs value={settingPage} className="h-full w-full gap-0" onValueChange={handleTabChange}>
        <TabsList className="w-full gap-2 rounded-none">
          {settings.filter((v) => !v.hidden).map((v) => {
            return (
              <TabsTrigger key={v.name} value={v.name} className="hover:bg-primary/5">{v.name}</TabsTrigger>
            );
          })}
        </TabsList>
        {settings.filter((v) => !v.hidden).map((v) => {
          const Content = v.child;
          return (
            <TabsContent
              className="overflow-y-auto"
              id="id-settings-tab-content"
              key={v.name} value={v.name}
            >
              <div
                className="p-2"
              >
                <Content />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    );
}
