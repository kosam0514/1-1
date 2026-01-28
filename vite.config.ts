import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // CRITICAL: base: './' ensures assets are loaded via relative paths, 
    // fixing the white screen issue on GitHub Pages (sub-path hosting).
    base: './', 
    define: {
      // Safely expose API_KEY during build if it exists in the build environment
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Prevent "process is not defined" error in browser
      'process.env': JSON.stringify({ API_KEY: env.API_KEY || '' })
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
    }
  };
});