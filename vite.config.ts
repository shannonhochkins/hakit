import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import { config } from './config';
// https://vitejs.dev/config/
export default defineConfig({
  root: "/usr/app",  // Set root directory
  server: {
    port: config.ports.CLIENT_PORT,
  },
  preview: {
    port: config.ports.CLIENT_PORT
  },
  build: {
    outDir: './client/dist',
  },
  define: {
    // This is to avoid undefined error(s) when using process.env from
    // server files.
    'process.env': {},
  },
  plugins: [tsconfigPaths(), react()]
});
