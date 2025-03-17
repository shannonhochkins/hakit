import { build, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import federation from "@originjs/vite-plugin-federation";
// import { dynamicImportWithImportMap } from '@kanamone/vite-plugin-dynamic-import-with-import-map'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    TanStackRouterVite(),
    federation({
      // The "name" can be any string identifying this host
      name: 'myHost',
      // You can leave remotes: {} empty if you're loading them at runtime
      filename: 'remoteEntry.js',
      remotes: {
        dummy: {
          external: "",
          externalType: 'url',
          format: "esm",
        },
      },
      shared: ['react', 'react-dom', '@hakit/core', '@hakit/components', 'framer-motion', '@measured/puck', '@emotion/styled', '@emotion/react'],
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    manifest: false,
    rollupOptions: {
      // external: (id) => /^\/api\/asset\//.test(id),
    }
  },
});

