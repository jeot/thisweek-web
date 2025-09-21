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
// import { cn } from "@/lib/utils";
// import { Badge } from "./ui/badge";
import { CloudIcon, CloudOffIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAppLogic } from "@/store/appLogic";
import { LoginForm } from "./login-form";
import { LoggedinForm } from "./logged-in-from";
import { SignUpForm } from "./sign-up-form";
import { ForgotPasswordForm } from "./forgot-password-form";

export function LoginSheet() {
  const showLoginInfoModal = useAppLogic((state) => state.showLoginInfoModal);
  const setShowLoginInfoModal = useAppLogic((state) => state.setShowLoginInfoModal);
  const session = useAuthStore((state) => state.session);
  const fetchClaims = useAuthStore((state) => state.fetchClaims);

  const open = showLoginInfoModal !== null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) setShowLoginInfoModal(null); }}>
      <SheetTrigger asChild className="">
        <Button variant="ghost" onClick={() => {
          if (session) setShowLoginInfoModal('logged-in');
          else setShowLoginInfoModal('login');
        }}>
          {session && <CloudIcon className="text-green-600" /> || <CloudOffIcon className="text-gray-500" />}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-md max-w-md sm:max-w-md p-4 overflow-auto" side="right">
        <SheetHeader>
          <SheetTitle>Cloud Sync ☁️</SheetTitle>
          <SheetDescription>
            {!session && "Login with your account to enable sync on multiple devices..."}
            {session && "Login successful."}
          </SheetDescription>
        </SheetHeader>
        <div className="">
          {!session && showLoginInfoModal === null && <LoginForm />}
          {!session && showLoginInfoModal === "login" && <LoginForm />}
          {!session && showLoginInfoModal === "sign-up" && <SignUpForm />}
          {!session && showLoginInfoModal === "forgot-password" && <ForgotPasswordForm />}
          {session && <LoggedinForm user={session.user} onLogOut={() => fetchClaims()} />}
        </div>
      </SheetContent>
    </Sheet >
  )
}
