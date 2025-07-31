import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'bin/index': './src/bin/index.ts',
    'bundle/bundle': './src/bundle/bundle.ts',
    'bundle/dev': './src/bundle/dev.ts',
    'bundle/shared': './src/bundle/shared.ts',
    'component/index': './src/component/index.ts',
  },
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  outDir: 'dist',
});
