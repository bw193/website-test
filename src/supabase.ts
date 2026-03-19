import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

console.log("Supabase Config Check:", { 
  hasUrl: !!supabaseUrl, 
  urlLength: supabaseUrl.length,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length,
  keyStart: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'none'
});

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Initialize with dummy values if missing to prevent crash, 
// but we'll check hasSupabaseConfig before use.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
