import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppState } from "@/store/appStore";

export function useAuth() {
  const setAuthSession = useAppState((state) => state.setAuthSession);
  const setAuthData = useAppState((state) => state.setAuthData);
  const setAuthError = useAppState((state) => state.setAuthError);

  const doThings = async () => {
    try {
      const start = Date.now();
      const result = await supabase.auth.getSession();
      setAuthSession(result.data.session);
      const { data, error } = await supabase.auth.getClaims();
      console.log("setAuthting claims: ", { data, error });
      setAuthData(data);
      setAuthError(error ?? null);
      console.log("Finished JWT auth in ", Date.now() - start, "ms");
    } catch (err) {
      console.error("error refreshing claims:", err);
    }
  };

  useEffect(() => {
    doThings();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      doThings();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
}

