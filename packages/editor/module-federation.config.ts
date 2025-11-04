import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { dependencies } from './package.json';
import path from 'node:path';

export default createModuleFederationConfig({
  name: 'editor',
  remotes: {
    // 'provider': 'rslib_provider@https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json',
  },
  dts: false,
  shared: {
    react: {
      singleton: true,
      eager: true, // Host provides React
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies.react,
    },
    'react-dom': {
      singleton: true,
      eager: true, // Host provides React DOM
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['react-dom'],
    },
    '@hakit/core': {
      singleton: true,
      eager: true, // Host provides this
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['@hakit/core'],
    },
    '@hakit/components': {
      singleton: true,
      eager: true, // Host provides this
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['@hakit/components'],
    },
    '@measured/puck': {
      singleton: true,
      eager: true, // Host provides this
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['@measured/puck'],
    },
    '@emotion/react': {
      singleton: true,
      eager: true, // Host provides this
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['@emotion/react'],
    },
    'monaco-editor': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['monaco-editor'],
    },
    '@monaco-editor/react': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['@monaco-editor/react'],
    },
    'home-assistant-js-websocket': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['home-assistant-js-websocket'],
    },
    'lucide-react': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['lucide-react'],
    },
    zod: {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['zod'],
    },
    'react-use': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['react-use'],
    },
    '@hakit/addon/components': {
      import: path.resolve(__dirname, 'src/components/hakit-addon-shared.tsx'),
      requiredVersion: false,
      singleton: true,
      shareScope: 'default',
      shareKey: '@hakit/addon/components',
      packageName: '@hakit/addon/components',
      version: '0.0.0',
      eager: true, // optional
    },
  },
});
