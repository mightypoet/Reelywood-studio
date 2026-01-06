
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd } from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
    },
  };
});
