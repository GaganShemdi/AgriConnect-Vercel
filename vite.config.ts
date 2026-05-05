import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


// vite config for agriconnect
// dev server -> localhost:5173
// for the phone view just hit f12 -> ctrl+shift+m


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*'],
      manifest: {
        name: 'AgriConnect',
        short_name: 'AgriConnect',
        description:
          'Multilingual AI-Powered Crop Advisory, Mandi Prices & Weather for Indian Farmers',
        theme_color: '#2D6A4F',
        background_color: '#D8F3DC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
