import { useState } from "react"
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, CheckCheck, Settings, CalendarHeart } from "lucide-react"
import { Moon, Sun } from 'lucide-react';
import HeaderContent from "./HeaderContent";
import { PageViewType } from "@/types/types";


export function SidebarLayout({ children, onMenuClick, activeView, title }: { children: React.ReactNode, onMenuClick: (view: PageViewType) => void, activeView: PageViewType, title: string }) {

  activeView; // unused variable

  const [open, setOpen] = useState(false); // only for sheet on mobile
  const [collapsed, setCollapsed] = useState(true); // only for drawer on desktop
  const { setTheme, theme } = useTheme();
  if (!theme) return;
  const ThemeIcon = (theme === 'light') ? Moon : Sun;

  const menuItems = [
    { icon: CheckCheck, label: "This Week", onClick: () => { onMenuClick('This Week') } },
    { icon: CalendarHeart, label: "Year 2025", onClick: () => { onMenuClick('This Year') } },
    { icon: null, label: "Spacer", onClick: () => { } },
    { icon: Settings, label: "Settings", onClick: () => { onMenuClick('Settings') } },
    { icon: ThemeIcon, label: theme === 'light' ? 'Dark' : 'Light', onClick: () => setTheme(theme === 'light' ? 'dark' : 'light') },
  ]

  return (
    <div className="flex flex-row h-screen w-screen">

      {/* Sidebar - Wide view only (desktop or horizental mobile) */}
      <div
        className={`hidden sm:flex flex-col flex-none transition-all duration-300 border-r box-content ${collapsed ? "w-16" : "w-48"}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="w-auto m-2 p-2 justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu />
        </Button>
        <div className="flex flex-col h-full space-y-2">
          {menuItems.map(({ icon: Icon, label, onClick }) => {
            if (!Icon) return (<div key={label} className="mt-auto" />)
            else return (
              <Button
                key={label}
                variant="shk"
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
        <header className="flex h-13 items-center justify-left border-b box-content">
          {/* Sheet open button (visible on small view only) */}
          <div className="sm:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <Button
                  variant="ghost" size="icon"
                  className="p-2 m-2 w-12 justify-center"
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
                <SheetClose>
                  <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-start"
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
                        variant="ghost"
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
                  &nbsp;{open && `v${__APP_VERSION__}`}
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
        <div className="flex-1 w-full overflow-y-auto">
          {children}
        </div>

      </div>

    </div >
  )
}

