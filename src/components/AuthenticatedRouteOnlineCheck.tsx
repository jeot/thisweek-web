import { useEffect, useState } from "react"
import { supabase_client } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js";

export default function AuthenticatedRouteOnlineCheck() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const client = supabase_client;
      const { data, error } = await client.auth.getUser()
      const u = data.user;
      setUser(u);

      if (error) {
        // we can redirect somewhere else like this:
        // location.href = "/login"
        console.log("not authenticated! error:", error);
      }
    }
    checkAuth()
  }, [])

  console.log("new user auth state: ", user);
  var prettyUser = JSON.stringify(user, null, 2); // spacing level = 2
  return <div>
    <p>Authenticated page</p>
    <pre className="text-xxs">{prettyUser}</pre>
  </div>;
}
