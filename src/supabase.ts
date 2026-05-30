import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hasSupabaseConfig, supabaseConfig } from './supabaseConfig';

export { hasSupabaseConfig };

// Initialize with dummy values if missing to prevent crash, 
// but we'll check hasSupabaseConfig before use.
export const supabase: SupabaseClient = createClient(
  supabaseConfig.url || 'https://placeholder.supabase.co',
  supabaseConfig.anonKey || 'placeholder'
);
