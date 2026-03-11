import { pluginReact } from '@rsbuild/plugin-react';
import { CreateRsbuildOptions } from '@rsbuild/core';
import path from 'path';
import { createRequire } from 'module';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type ModuleFederationPluginOptions = moduleFederationPlugin.ModuleFederationPluginOptions;

// Use createRequire to load CommonJS module in ESM
const require = createRequire(import.meta.url);
const { pluginModuleFederation } = require('@module-federation/rsbuild-plugin');

export function createRsbuildConfig(moduleFederationConfig: ModuleFederationPluginOptions, projectPath: string): CreateRsbuildOptions {
  return {
    cwd: projectPath,
    rsbuildConfig: {
      source: {
        entry: {
          index: path.resolve(projectPath, './src/index.ts'),
        },
      },
      output: {
        assetPrefix: '{{{_HAKIT_ASSET_PREFIX_}}}',
        distPath: {
          root: path.resolve(projectPath, './dist/mf'),
        },
      },
      performance: {
        chunkSplit: {
          strategy: 'single-vendor',
          override: {
            chunks: 'all',
            minSize: 100000,
            maxSize: 500000,
            cacheGroups: {
              vendor: {
                chunks: 'all',
                name: 'vendor',
                priority: 10,
                reuseExistingChunk: true,
                test: /[\\/]node_modules[\\/]/,
                filename: pathData => {
                  return `static/js/vendor/${pathData.chunk?.name ?? ''}.js`;
                },
              },
              components: {
                test: /src[\\/]components/,
                name: 'components',
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
              },
            },
          },
        },
      },
      dev: {
        hmr: false,
      },
      server: {
        port: 0, // Don't start a server during build
      },
      plugins: [
        pluginReact({
          swcReactOptions: {
            // Keep Emotion JSX/css-prop support without forcing the SWC emotion
            // wasm plugin into consumer projects, which can drift out of sync with
            // the consumer's resolved Rsbuild/Rspack toolchain.
            importSource: '@emotion/react',
          },
        }),
        pluginModuleFederation(moduleFederationConfig),
      ],
    },
  };
}
