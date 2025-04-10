
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "980169ec-b704-4303-a6ce-f36f12bad555.lovableproject.com"
    ]
  },
  plugins: [
    react(),
    // Removed componentTagger that was causing errors
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
