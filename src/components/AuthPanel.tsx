import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuthState } from "@/store/authStore";
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function AuthPanel() {
  const data = useAuthState((state) => state.data);
  const error = useAuthState((state) => state.error);
  const { setTheme, theme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // todo: this is global (kills all sessions), make it local in the future.
    supabase.auth.signOut()
      .then((err) => {
        if (err === null) {
          console.log("loged out successful!");
        } else {
          console.log("log out failed! err:", err);
          if (err?.error?.name === "AuthSessionMissingError") {
            console.log("session is already terminated in supabase. good!");
          }
        }
        setIsLoggingOut(false);
      })
      .catch((err) => {
        console.log("log out failed! err:", err);
        setIsLoggingOut(false);
      })
    // optionally, clear state, show notification, or reload
  }

  useEffect(() => {
  }, [])

  if (error || !data?.claims) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col gap-1">
        <p className="font-semibold">Log in or sign up to sync your data across devices.</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme={theme}
          providers={[]} // Add "google", "github", etc. later if needed
        />
      </div>
    )
  } else {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col gap-3">
        <p className="font-semibold">
          You're logged in as <span className="text-green-600">{data.claims.email}</span>.
          <br />
          To stop syncing, simply log out.
        </p>
        <Button variant="destructive" className={isLoggingOut && "bg-destructive/50" || "hover:cursor-pointer"} disabled={isLoggingOut} onClick={() => handleLogout()}>Logout</Button>
        <span className="font-light font-mono text-xxs">{JSON.stringify(data.claims, null, 2)}</span>
        <span className="font-light font-mono text-xxs">{JSON.stringify(data.header, null, 2)}</span>
      </div>
    )
  }
}

