import { defineConfig } from 'tsup';

/**
 * Multi-build:
 * 1. Browser (ES2022) for React component exports (index.tsx)
 * 2. Node 18 for CLI / tooling entries
 *
 * Both share dist; browser build marks React externals to allow consumer bundlers to tree-shake.
 */

export default defineConfig(
  // Node build for tool / CLI code
  {
    entry: {
      index: './shared-components/index.tsx',
    },
    format: ['esm'],
    platform: 'browser',
    target: 'es2022',
    // No need to regenerate dts for these as index covers this
    dts: true,
    clean: false, // keep dist from first build
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
  }
);
