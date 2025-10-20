import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient;

export function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase URL or service key is missing.");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}
