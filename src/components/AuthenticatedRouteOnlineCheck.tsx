import { useEffect, useState } from "react"
import { supabase_client } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";

export default function AuthenticatedRouteOnlineCheck() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const client = supabase_client;
      let userResult = await client.auth.getUser()
      setUser(userResult.data?.user || null);
      let sessionResult = await client.auth.getSession()
      setSession(sessionResult.data?.session || null);

      if (userResult.error || sessionResult.error) {
        // we can redirect somewhere else like this:
        // location.href = "/login"
        console.log("not authenticated!");
      }
    }
    checkAuth()
  }, [])

  // console.log("new user auth state: ", user);
  var prettyUser = JSON.stringify(user, null, 2); // spacing level = 2
  var prettySession = JSON.stringify(session, null, 2); // spacing level = 2
  return <div>
    <p>Auth Info (Online Check)</p>
    <p>Session</p>
    <pre className="text-xxs">{prettySession}</pre>
    <p>User</p>
    <pre className="text-xxs">{prettyUser}</pre>
  </div>;
}
