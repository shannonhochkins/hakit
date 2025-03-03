import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    TanStackRouterVite(),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
});