import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import moduleFederationConfig from './module-federation.config';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';

export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
        importSource: '@emotion/react',
      },
    }),
    pluginModuleFederation(moduleFederationConfig, {}),
  ],
  html: {
    template: './static/index.html',
  },
  // Performance optimizations
  performance: {
    // Optimize chunk splitting for better loading performance
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      context: '/api',
      target: 'http://localhost:3002',
      changeOrigin: true,
    },
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
      ignoreWarnings: [
        {
          message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
        },
      ],
      module: {
        rules: [
          {
            test: /\.md$/i,
            type: 'asset/source',
          },
        ],
      },
    },
    swc: {
      jsc: {
        experimental: {
          plugins: [
            [
              '@swc/plugin-emotion',
              {
                // Disable source maps in production for better performance
                sourceMap: process.env.NODE_ENV === 'development',
                // Only add labels in development
                autoLabel: 'dev-only',
                labelFormat: '[local]',
                // Optimize css prop usage - reduces runtime overhead
                cssPropOptimization: true,
              },
            ],
          ],
        },
      },
    },
  },
});
