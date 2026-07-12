import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  isValidSupabaseUrl(supabaseUrl) && Boolean(supabaseAnonKey);

// Los valores locales evitan que una configuración pendiente rompa el build.
// La aplicación no consulta este cliente mientras isSupabaseConfigured sea false.
export const supabase = createClient(
  isValidSupabaseUrl(supabaseUrl) ? supabaseUrl : "http://127.0.0.1:54321",
  supabaseAnonKey || "supabase-anon-key-not-configured",
);
