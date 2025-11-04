import { defineConfig } from 'tsup';

/**
 * Multi-build:
 * 1. Browser (ES2022) for React component exports (index.tsx)
 * 2. Node 18 for CLI / tooling entries
 *
 * Both share dist; browser build marks React externals to allow consumer bundlers to tree-shake.
 */

export default defineConfig([
  // Node build for tool / CLI code
  {
    entry: {
      index: './src/index.ts',
      'bin/index': './src/bin/index.ts',
      'bundle/bundle': './src/bundle/bundle.ts',
      'bundle/dev': './src/bundle/dev.ts',
      'bundle/shared': './src/bundle/shared.ts',
      'component/index': './src/component/index.ts',
    },
    format: ['esm'],
    platform: 'node',
    target: 'node18',
    dts: true,
    clean: false, // handled manually via build script in package json
    splitting: false,
    sourcemap: false,
    minify: false,
    outDir: 'dist',
    treeshake: false,
  },
  // component addon
  {
    entry: {
      index: './shared-components/index.tsx',
    },
    format: ['esm'],
    platform: 'browser',
    target: 'es2022',
    dts: {
      // IMPORTANT - The javascript for the addon components should not be part
      // of the bundle, only the types, module federation will handle the javascript loading from the host
      only: true,
    },
    clean: false, // handled manually via build script in package json
    splitting: false,
    sourcemap: false,
    minify: false,
    outDir: 'dist/components',
    treeshake: false,
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-is',
      '@emotion/sheet',
      '@emotion/cache',
      '@emotion/serialize',
      '@emotion/utils',
    ],
  },
]);
