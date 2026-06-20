import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // This warns during local dev / build if the .env file is missing,
  // instead of failing silently with a confusing network error later.
  console.warn(
    "⚠️ Supabase env vars are missing. Check that VITE_SUPABASE_URL and " +
    "VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env.local file (or in " +
    "Vercel → Project Settings → Environment Variables)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
