import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  // SheetClose,
} from "@/components/ui/sheet"
import { useAuthStore } from "@/store/authStore";
import { LoginInfoModalType, useAppLogic } from "@/store/appLogic";
import { LoginForm } from "./login-form";
import { LoggedinForm } from "./logged-in-from";
import { SignUpForm } from "./sign-up-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { UpdatePasswordForm } from "./update-password-form";
import { SyncProgressCard } from "./SyncProgressCard";
import { CloudSyncIcon } from "./CloudSyncIcon";

export function LoginSheet() {
  const showLoginInfoModal = useAppLogic((state) => state.showLoginInfoModal);
  const setShowLoginInfoModal = useAppLogic((state) => state.setShowLoginInfoModal);
  const session = useAuthStore((state) => state.session);
  const isMobile = useAppLogic((s) => s.isMobile);

  function handleOnSwitch(l: LoginInfoModalType) {
    setShowLoginInfoModal(l);
  }

  const open = showLoginInfoModal !== null;

  return (<Sheet
    open={open}
    onOpenChange={(o) => { if (!o) setShowLoginInfoModal(null); }
    }>
    <SheetTrigger asChild className="">
      <Button variant="ghost" className="p-3" onClick={() => {
        if (session) setShowLoginInfoModal('logged-in');
        else setShowLoginInfoModal('login');
      }}>
        <CloudSyncIcon />
      </Button>
    </SheetTrigger>
    <SheetContent
      className="w-sm max-w-full p-4 overflow-auto" side="right"
      onOpenAutoFocus={(e) => {
        if (isMobile) e.preventDefault(); // stop sheet from auto-focusing the first focusable element
      }}
    >
      <SheetHeader>
        <SheetTitle>Cloud Sync ☁️</SheetTitle>
        <SheetDescription>
          {!session && "Login with your account to enable cloud syncing on multiple devices."}
          {session && "Login successful."}
        </SheetDescription>
      </SheetHeader>
      <div className="">
        {session && showLoginInfoModal !== 'update-password' &&
          <div className="flex flex-col gap-4">
            <LoggedinForm user={session.user} onSwitch={handleOnSwitch} />
            <SyncProgressCard />
          </div>}
        {session && showLoginInfoModal === 'update-password' && <UpdatePasswordForm onSwitch={handleOnSwitch} />}
        {!session && showLoginInfoModal === null && <LoginForm onSwitch={handleOnSwitch} />}
        {!session && showLoginInfoModal === "login" && <LoginForm onSwitch={handleOnSwitch} />}
        {!session && showLoginInfoModal === "logged-in" && <LoginForm onSwitch={handleOnSwitch} />}
        {!session && showLoginInfoModal === "sign-up" && <SignUpForm onSwitch={handleOnSwitch} />}
        {!session && showLoginInfoModal === "forgot-password" && <ForgotPasswordForm onSwitch={handleOnSwitch} />}
        {!session && showLoginInfoModal === "update-password" && <ForgotPasswordForm onSwitch={handleOnSwitch} />}
      </div>
    </SheetContent>
  </Sheet >
  )
}
