 // vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use the minified version of sockjs-client which has fewer issues
      'sockjs-client': 'sockjs-client/dist/sockjs.min.js',
    },
  },
  define: {
    // Provide a polyfill for the 'global' object used by sockjs
    global: 'window',
  },
});