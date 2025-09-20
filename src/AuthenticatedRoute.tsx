import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js";

export default function AuthenticatedRoute() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const client = createClient()
      const { data, error } = await client.auth.getUser()
      const u = data.user;
      setUser(u);

      if (error) {
        location.href = "/login"
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
