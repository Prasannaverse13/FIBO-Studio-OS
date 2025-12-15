import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ""),
      'process.env.BRIA_API_KEY': JSON.stringify(env.BRIA_API_KEY || process.env.BRIA_API_KEY || ""),
      'process.env.BRIA_MCP_API_KEY': JSON.stringify(env.BRIA_MCP_API_KEY || process.env.BRIA_MCP_API_KEY || ""),
      // Provide a fallback for other process.env accesses to avoid crashes
      'process.env': {}
    },
    build: {
      outDir: 'dist',
    }
  };
});