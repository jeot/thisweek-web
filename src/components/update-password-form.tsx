import { cn } from '@/lib/utils'
import { supabase_client } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { LoginInfoModalType } from '@/store/appLogic'

export function UpdatePasswordForm({ className, onSwitch, ...props }: React.ComponentPropsWithoutRef<'div'> & { onSwitch?: (l: LoginInfoModalType) => void }) {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const matchError = (password2.length > 0) && (password !== password2);
  const allowSubmit = (password2.length > 0) && (password === password2);

  const handleForgotPassword = async (e: React.FormEvent) => {
    const supabase = supabase_client;
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      // the parrent probably will show the loggedin page because of an active session
      if (onSwitch) onSwitch('login');
      else location.href = '/app'
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Please enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  className={cn(allowSubmit && "ring-[3px] ring-green-600/50 focus-visible:ring-green-600/50")}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password2">Type password again</Label>
                <Input
                  id="password2"
                  type="password"
                  placeholder="Type password again"
                  required
                  value={password2}
                  className={cn(matchError && "focus-visible:ring-destructive/50",
                    allowSubmit && "ring-[3px] ring-green-600/50 focus-visible:ring-green-600/50")}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading || !allowSubmit}>
                {isLoading ? 'Saving...' : 'Save new password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
