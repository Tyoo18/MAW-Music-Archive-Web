import { createClient } from "@supabase/supabase-js";

// [INIT]: Tarik environment variables untuk kredensial koneksi cloud
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// [VALIDATE]: Proteksi dasar biar server gak crash kalau env lupa diisi
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment parameters.");
}

// [UTIL]: Export instance client Supabase yang siap dipakai di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
