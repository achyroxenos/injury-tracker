import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const missingConfigMessage =
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

function createUnconfiguredClient(): SupabaseClient {
    return new Proxy({} as SupabaseClient, {
        get() {
            throw new Error(missingConfigMessage);
        },
    });
}

export const supabase: SupabaseClient = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : createUnconfiguredClient();
