import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { AuthError, JwtHeader, JwtPayload, Session } from '@supabase/supabase-js'

type AuthDataType = {
	claims: JwtPayload;
	header: JwtHeader;
	signature: Uint8Array;
}

type AuthStore = {
	session: Session | null;
	data: AuthDataType | null;
	error: AuthError | null;
	loading: boolean;
	fetchClaims: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
	session: null,
	data: null,
	error: null,
	loading: false,
	fetchClaims: async () => {
		const start = Date.now();
		set({ loading: true })
		try {
			const result = await createClient().auth.getSession();
			if (!result.error) {
				set({ session: result.data.session })
			} else {
				set({ session: null })
			}
			const { data, error } = await createClient().auth.getClaims()
			console.log("got claims: ", { data, error });
			set({ data, error })
		} catch (err) {
			console.log("fetchClaims exception! err:", err);
		}
		set({ loading: false })
		console.log("Finished fetching JWT Claims in ", Date.now() - start, "ms");
	},
}))




