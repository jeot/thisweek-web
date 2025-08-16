import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, CheckCheck, Settings } from "lucide-react"
// import { CalendarHeart, ListTodo } from "lucide-react"
import { Moon, Sun } from 'lucide-react';
import HeaderContent from "./HeaderContent";
import { PageViewType } from "@/types/types";
import { cn } from "@/lib/utils";
import { useAppLogic } from "@/store/appLogic";
import { useThemeConfig } from "@/store/themeConfig";
import { useOtherConfigs } from "@/store/otherConfigs";


export function SidebarLayout({ children, activeView, title }: { children: React.ReactNode, activeView: PageViewType, title: string }) {

  activeView; // unused variable

  const [open, setOpen] = useState(false); // only for sheet on mobile
  const collapsed = useOtherConfigs((state) => state.sidebarCollapsed);
  const setCollapsed = useOtherConfigs((state) => state.setSidebarCollapsed);
  const toggleTheme = useThemeConfig((state) => state.toggleTheme);
  const theme = useThemeConfig((state) => state.theme);
  if (!theme) return;

  const requestPageViewChange = useAppLogic((state) => state.requestPageViewChange);

  const ThemeIcon = (theme.mode === 'light') ? Moon : Sun;

  const menuItems = [
    { icon: CheckCheck, label: "This Week", onClick: () => { requestPageViewChange('This Week') } },
    // { icon: CalendarHeart, label: "Year 2025", onClick: () => { requestPageViewChange('This Year') } },
    // { icon: ListTodo, label: "Projects", onClick: () => { requestPageViewChange('Projects') } },
    { icon: null, label: "Spacer", onClick: () => { } },
    { icon: Settings, label: "Settings", onClick: () => { requestPageViewChange('Settings') } },
    { icon: ThemeIcon, label: theme.mode === 'light' ? 'Dark' : 'Light', onClick: () => toggleTheme() },
  ]

  return (
    <div className="flex flex-row h-screen w-screen">

      {/* Sidebar - Wide view only (desktop or horizental mobile) */}
      <div
        className={cn("hidden sm:flex flex-col flex-none transition-all duration-200 border-r box-content",
          `${collapsed ? "w-14" : "w-48"}`)}
      >
        <Button
          variant="ghost"
          size="icon"
          className="w-auto justify-center px-2 py-6 rounded-none"
          onClick={() => {
            setCollapsed(!collapsed)
            // hack: the TextareaAutosize used in <Item> only listens to resize event
            // Delay to let the layout settle (especially if animated)
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 400); // adjust this if needed
          }}
        >
          <Menu />
        </Button>
        <div className="flex flex-col h-full space-y-2">
          {menuItems.map(({ icon: Icon, label, onClick }) => {
            if (!Icon) return (<div key={label} className="mt-auto" />)
            else return (
              <Button
                key={label}
                variant={activeView == label ? "default" : "shk"}
                size="icon"
                className={`w-auto m-2 p-2 ${collapsed ? "" : "justify-start"}`}
                onClick={onClick}
              >
                <Icon />{!collapsed && <span>{label}</span>}
              </Button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          &nbsp;{!collapsed && `v${__APP_VERSION__}`}
        </p>
      </div>

      {/* Header + Content */}
      <div className="flex flex-col flex-1 w-1">

        {/* Full Header */}
        <header className="flex h-12 items-center justify-left border-b box-content">
          {/* Sheet open button (visible on small view only) */}
          <div className="sm:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="w-14 justify-center px-2 py-6 rounded-none"
                  onClick={() => setOpen(true)}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-2">
                <SheetHeader className="hidden">
                  <SheetTitle>Sheet Menu</SheetTitle>
                  <SheetDescription>
                    &nbsp;
                  </SheetDescription>
                </SheetHeader>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-center px-2 py-2 rounded-none"
                  >
                    <Menu />
                  </Button>
                </SheetClose>
                <div className="flex flex-col h-full space-y-2">
                  {menuItems.map(({ icon: Icon, label, onClick }) => {
                    if (!Icon) return (<div key={label} className="mt-auto" />)
                    else return (
                      <Button
                        key={label}
                        variant={activeView == label ? "default" : "shk"}
                        className="justify-start"
                        onClick={() => {
                          onClick();
                          setOpen(false);
                        }}
                      >
                        <Icon className="mr-2" /> {label}
                      </Button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  &nbsp;{open && `v${__APP_VERSION__} `}
                </p>
              </SheetContent>
            </Sheet>
          </div>
          {/* Header Content */}
          <div className="p-0 m-0 flex-1 h-full border-s sm:border-none">
            <HeaderContent title={title} />
          </div>
        </header>

        {/* Main Content */}
        <div id="main-content-window" className="@container flex-1 w-full overflow-y-auto">
          {children}
        </div>

      </div>

    </div >
  )
}

