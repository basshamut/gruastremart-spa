import { createClient } from "@supabase/supabase-js";

// Lee las variables de entorno que creaste
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crea el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
