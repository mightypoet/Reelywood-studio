
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import cwd specifically to avoid type conflicts with global Process types.
import { cwd } from 'node:process';

export default defineConfig(({ mode }) => {
  // Fix: Use the imported cwd() function directly instead of process.cwd().
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
  };
});
