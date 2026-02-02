
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
    console.log('Supabase Sync Node Online');
  } catch (e) {
    console.error('CRITICAL: Supabase initialization failed:', e);
  }
} else {
  console.warn('Supabase credentials missing or invalid. Dashboard features may be limited.');
}

export const supabase = client;
