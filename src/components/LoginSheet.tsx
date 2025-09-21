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
import { LoginForm } from "./login-form";
import { LoggedinForm } from "./logged-in-from";

export function LoginSheet() {
  const session = useAuthStore((state) => state.session);
  const fetchClaims = useAuthStore((state) => state.fetchClaims);

  return (
    <Sheet>
      <SheetTrigger className="">
        <Button variant="ghost">
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
          {!session && <LoginForm />}
          {session && <LoggedinForm user={session.user} onLogOut={() => fetchClaims()} />}
        </div>
      </SheetContent>
    </Sheet >
  )
}
