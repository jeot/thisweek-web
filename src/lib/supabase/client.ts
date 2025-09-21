import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createClient() {
  return createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}

// Export a single client instance
export const supabase_client = createClient();
