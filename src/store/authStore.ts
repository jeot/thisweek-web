import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

type AuthStore = {
  session: Session | null;
  data: any;
  error: any;
  loading: boolean;
  fetchClaims: () => Promise<void>;
}

export const useAuthState = create<AuthStore>((set) => ({
  session: null,
  data: null,
  error: null,
  loading: false,
  fetchClaims: async () => {
    const start = Date.now();
    set({ loading: true })
    try {
      const result = await supabase.auth.getSession();
      if (!result.error) {
        set({ session: result.data.session })
      } else {
        set({ session: null })
      }
      const { data, error } = await supabase.auth.getClaims()
      console.log("got claims: ", { data, error });
      set({ data, error })
    } catch (err) {
      console.log("fetchClaims exception! err:", err);
    }
    set({ loading: false })
    console.log("Finished fetching JWT Claims in ", Date.now() - start, "ms");
  },
}))




