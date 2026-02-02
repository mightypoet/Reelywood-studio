import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let client = null;

if (supabaseUrl && supabaseUrl.startsWith('http')) {
  try {
    // Initializing with the keys provided in the environment.
    // Handles VITE_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, etc. via the vite.config mapping.
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase Sync Node Online:', supabaseUrl);
  } catch (e) {
    console.error('CRITICAL: Supabase initialization failed:', e);
  }
} else {
  console.warn('Supabase credentials missing or invalid. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
}

export const supabase = client;