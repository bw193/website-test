import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mxmmffwntosvwaviippd.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!anonKey) {
  console.log("No anon key found in process.env");
}

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'hero_bg').single();
  console.log(data);
}

run();
