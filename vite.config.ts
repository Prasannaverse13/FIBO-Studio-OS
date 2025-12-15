import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Explicitly replace process.env.API_KEY with the value from the environment
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ""),
      
      // We also map Bria keys here, but constants.ts has the hardcoded fallback which is safer
      'process.env.BRIA_API_KEY': JSON.stringify(env.BRIA_API_KEY || process.env.BRIA_API_KEY || ""),
      'process.env.BRIA_MCP_API_KEY': JSON.stringify(env.BRIA_MCP_API_KEY || process.env.BRIA_MCP_API_KEY || ""),
      
      // Safety definition to prevent crashing if a library accesses process.env.SOMETHING_ELSE
      // We do NOT use 'process.env': {} because it can override specific replacements in some edge cases
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
    }
  };
});