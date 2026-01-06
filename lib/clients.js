
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let client = null;

// Only attempt to create the client if we have a valid URL.
// This prevents the "supabaseUrl is required" Uncaught Error.
if (supabaseUrl && supabaseUrl.startsWith('http')) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('CRITICAL: Supabase initialization failed:', e);
  }
} else {
  console.warn('Supabase credentials missing or invalid. Database features will be disabled.');
}

export const supabase = client;
