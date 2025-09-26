import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import { supabase_client } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { LoginInfoModalType } from '@/store/appLogic';

export function LoggedinForm({ className, user, onSwitch, ...props }: React.ComponentPropsWithoutRef<'div'> & { user?: any, onSwitch?: (l: LoginInfoModalType) => void }) {
  const email: string = user?.email;
  const username: string = email.split("@", 1).at(0) || "---";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // todo: this is global (kills all sessions), make it local in the future.
    supabase_client.auth.signOut()
      .then(({ error }) => {
        if (error === null) {
          console.log("loged out successful!");
        } else {
          console.log("log out failed! error:", error);
          if (error?.name === "AuthSessionMissingError") {
            console.log("session is already terminated in supabase. good!");
          }
        }
        setIsLoggingOut(false);
        if (onSwitch) onSwitch('login');
      })
      .catch((err) => {
        console.log("log out failed! catched err:", err);
        setIsLoggingOut(false);
      })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">👾 Hello, {username}</CardTitle>
          <CardDescription>&nbsp;</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="">
              <span>You are logged in with the following email:</span>
              <pre>{email}</pre>
              <button
                type="button"
                onClick={() => { if (onSwitch) onSwitch("update-password") }}
                className="inline-block text-sm underline-offset-4 hover:underline text-left"
              >
                Change your password
              </button>
            </div>
            <Button variant="outline" className="flex items-center gap-2 disabled:opacity-50" disabled={isLoggingOut} onClick={() => handleLogout()}>
              {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoggingOut ? "Logout..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
