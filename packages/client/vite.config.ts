import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { dynamicImportWithImportMap } from '@kanamone/vite-plugin-dynamic-import-with-import-map'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    TanStackRouterVite(),
    dynamicImportWithImportMap([
      'react',
      'react-dom',
      '@hakit/core',
      '@hakit/components',
      // '@measured/puck',
      '@emotion/styled',
      '@emotion/react',
    ]),
  ],
  build: {
    manifest: true,
    rollupOptions: {
      external: (id) => /^\/api\/asset\//.test(id),
    }
  },
});