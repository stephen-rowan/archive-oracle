// Read-only Supabase client for testing
// This uses the anonymous key which respects Row Level Security (RLS) policies
// and only allows read operations based on your database policies

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file"
  );
}

// Create read-only client with explicit configuration
export const supabaseReadOnly = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Don't persist session for testing
    autoRefreshToken: false, // Don't auto-refresh tokens
  },
  db: {
    schema: "public", // Use public schema
  },
});

export default supabaseReadOnly;

