import { createClient } from '@supabase/supabase-js';

// Test if that strange key format throws a JWT error
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waiarddyksrvlvhhnxrz.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_x7wFhg4ArMEIwAJJYSrPog_AxdsqBfF';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log("Supabase error response:", error);
  } catch (e) {
    console.error("Exception:", e);
  }
}
test();
