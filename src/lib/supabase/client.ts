import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types.ts'

function createClient() {
  return createSupabaseClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}

// Export a single client instance
export const supabase_client = createClient();
