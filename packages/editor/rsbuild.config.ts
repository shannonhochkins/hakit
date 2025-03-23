import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import moduleFederationConfig from './module-federation.config';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';

export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        importSource: '@emotion/react',
      }
    }),
    pluginModuleFederation(moduleFederationConfig)
  ],
  html: {
    template: './static/index.html',
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      context: "/api",
      target: "http://localhost:5000",
      changeOrigin: true,
    }
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({ target: 'react', autoCodeSplitting: true }),
      ]
    },
    swc: {
      jsc: {
        experimental: {
          plugins: [['@swc/plugin-emotion', {}]],
        },
      },
    }
  }
});
