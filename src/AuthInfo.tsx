import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

export default function AuthInfo() {
  const session = useAuthStore((state) => state.session);
  const data = useAuthStore((state) => state.data);
  const error = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);
  const fetchClaims = useAuthStore((state) => state.fetchClaims);

  useEffect(() => {
    fetchClaims().then(() => {
      console.log("fetch claims done.");
    }).catch((e) => {
      console.log("fetch claims error: ", e);
    });
  }, [])

  var prettySession = JSON.stringify(session, null, 2); // spacing level = 2
  var prettyData = JSON.stringify(data, null, 2);
  var prettyError = JSON.stringify(error, null, 2);
  return <div>
    <p>Auth Info</p>
    {loading && <p className="text-xs">"Loading..."</p>}
    {<div><p>Session: </p><pre className="text-xxs">{prettySession}</pre></div>}
    {<div><p>Data: </p><pre className="text-xxs">{prettyData}</pre></div>}
    {<div><p>Error: </p><pre className="text-xxs">{prettyError}</pre></div>}
  </div>;
}
