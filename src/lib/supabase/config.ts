/**
 * Shared Supabase environment config + a guard that detects when the app is
 * still using the placeholder values from `.env.example`. This lets the UI
 * show a clear "configure Supabase" message instead of a cryptic
 * "Failed to fetch" network error.
 *
 * These are NEXT_PUBLIC_ vars, so the values are available on both the server
 * and the client.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when real (non-placeholder) Supabase credentials are present. */
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("your-project-ref") &&
    SUPABASE_ANON_KEY.length > 0 &&
    !SUPABASE_ANON_KEY.includes("your-anon")
  );
}

export const SUPABASE_SETUP_MESSAGE =
  "Supabase isn't configured yet. Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server.";
