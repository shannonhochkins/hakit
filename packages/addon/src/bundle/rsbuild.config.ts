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
      tools: {
        swc: {
          jsc: {
            experimental: {
              plugins: [['@swc/plugin-emotion', {}]],
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
            importSource: '@emotion/react',
          },
        }),
        pluginModuleFederation(moduleFederationConfig),
      ],
    },
  };
}
