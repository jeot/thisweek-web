import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from '@/lib/supabase'
import { useAppState } from "@/store/appStore";
import { Button } from './ui/button';
import { useState } from 'react';

export function AuthPanel() {
  const session = useAppState((state) => state.session);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    supabase.auth.signOut()
      .then(() => {
        console.log("loged out successful!");
        setIsLoggingOut(false);
      })
      .catch((err) => {
        console.log("log out failed! err:", err);
        setIsLoggingOut(false);
      })
    // optionally, clear state, show notification, or reload
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col gap-1">
        <p className="font-semibold">Log in or sign up to sync your data across devices.</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={[]} // Add "google", "github", etc. later if needed
        />
      </div>
    )
  } else {
    const username = session.user.email || session.user.id;
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col gap-3">
        <p className="font-semibold">
          You're logged in as <span className="text-green-600">{username}</span>.
          <br />
          To stop syncing, simply log out.
        </p>
        <Button variant="destructive" className={isLoggingOut && "bg-destructive/50" || "hover:cursor-pointer"} disabled={isLoggingOut} onClick={() => handleLogout()}>Logout</Button>
        <span className="font-light text-xs">({session.user.id})</span>
      </div>
    )
  }
}

