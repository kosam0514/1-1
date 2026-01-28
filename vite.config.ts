import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Vercel hosts at the root domain, so '/' is the standard base path.
    // Unlike GitHub Pages which often needs './' for subdirectories.
    base: '/', 
    define: {
      // Vercel injects env vars during the build.
      // We replace `process.env.API_KEY` in the code with the actual string value.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Prevent "process is not defined" error if generic process.env is accessed
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
    }
  };
});