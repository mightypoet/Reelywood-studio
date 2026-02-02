
import { createClient } from '@supabase/supabase-js';

// Prioritize import.meta.env for Vite compatibility, fall back to process.env
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

let client = null;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log('REELYWOOD_SYNC: Node Online');
  } catch (e) {
    console.warn('REELYWOOD_SYNC: Supabase init failed - limited functionality mode.');
  }
} else {
  console.warn('REELYWOOD_SYNC: Missing credentials. Check env configuration.');
}

export const supabase = client;
