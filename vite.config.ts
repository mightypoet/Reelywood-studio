
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import process from node:process to ensure Node.js types (like cwd) are available in the config module.
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Fix: process.cwd() is now correctly typed as a Node.js process method.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
  };
});
