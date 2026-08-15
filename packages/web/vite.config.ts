import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { siteAssets } from './vite-plugins/site-assets.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    siteAssets({
      apiDir: resolve(import.meta.dirname, '../generator/dist-api'),
      siteDir: resolve(import.meta.dirname, '../generator/dist-site'),
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
});
