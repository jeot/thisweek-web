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

  // Use your existing supabase_client variable
  async function forceLogoutClientSide() {
    setIsLoggingOut(true);
    // 1) Try to sign out (server-side revoke refresh token). Treat 403/session_not_found as OK.
    try {
      const { error } = await supabase_client.auth.signOut();
      if (error && error.status !== 403) {
        // real failure: forward or log
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (err: any) {
      // network / unexpected error -> still continue to clear client session
      console.warn('signOut() threw, continuing to clear local session:', err?.message ?? err);
    }

    // 2) Best-effort clear of localStorage keys that hold supabase auth
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(localStorage).forEach((k) => {
        // heuristics: remove obvious supabase/auth keys (v1 used "supabase.auth.token", v2 uses "<ref>-auth-token")
        if (/supabase|supabase\.auth\.token|-auth-token|auth/i.test(k)) {
          localStorage.removeItem(k);
        }
      });
    }

    // 3) Best-effort clear cookies that might carry tokens
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0]?.trim();
        if (!name) return;
        if (/supabase|sb:|session|auth/i.test(name)) {
          // expire cookie (path/domain may vary in your app)
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        }
      });
    }

    // 4) Your app: reset auth state / redirect
    // e.g. setUser(null); router.push('/login');

    setIsLoggingOut(false);
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
            <Button variant="outline" className="flex items-center gap-2 disabled:opacity-50" disabled={isLoggingOut} onClick={() => forceLogoutClientSide()}>
              {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoggingOut ? "Logout..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
