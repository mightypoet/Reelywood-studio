import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env from files AND merge with system process.env
  // This ensures variables set in hosting dashboards are correctly captured.
  const env = { 
    ...process.env, 
    // Fix: Property 'cwd' does not exist on type 'Process'. Cast to any to access Node.js process.cwd() method.
    ...loadEnv(mode, (process as any).cwd(), '') 
  };
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Map all common Supabase environment variable names
      'process.env.SUPABASE_URL': JSON.stringify(
        env.SUPABASE_URL || 
        env.NEXT_PUBLIC_SUPABASE_URL || 
        env.VITE_SUPABASE_URL || 
        ''
      ),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(
        env.SUPABASE_ANON_KEY || 
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
        env.VITE_SUPABASE_ANON_KEY || 
        ''
      ),
    },
    build: {
      sourcemap: false,
    },
    server: {
      sourcemapIgnoreList: false,
    },
  };
});