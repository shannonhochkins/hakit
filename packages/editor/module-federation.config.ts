import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { dependencies } from './package.json';
import { dependencies as rootDependencies } from '../../package.json';
import path from 'node:path';

const moduleFederationConfig = createModuleFederationConfig({
  name: 'editor',
  remotes: {
    // 'provider': 'rslib_provider@https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json',
  },
  dts: false,
  shared: {
    react: {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies.react,
    },
    'react-dom': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['react-dom'],
    },
    'react/jsx-runtime': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies.react,
    },
    'react/jsx-dev-runtime': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies.react,
    },
    '@hakit/core': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['@hakit/core'],
    },
    '@hakit/components': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['@hakit/components'],
    },
    '@emotion/react': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['@emotion/react'],
    },
    'home-assistant-js-websocket': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['home-assistant-js-websocket'],
    },
    'lucide-react': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['lucide-react'],
    },
    zod: {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['zod'],
    },
    'react-use': {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: dependencies['react-use'],
    },
    zustand: {
      singleton: true,
      eager: true,
      shareStrategy: 'loaded-first',
      requiredVersion: rootDependencies['zustand'],
    },
    '@hakit/addon/components': {
      import: path.resolve(__dirname, 'src/hakit-addon-shared.tsx'),
      requiredVersion: false,
      singleton: true,
      shareScope: 'default',
      shareKey: '@hakit/addon/components',
      packageName: '@hakit/addon/components',
      version: '0.0.0',
      eager: true,
    },
    '@hakit/addon/utils': {
      import: path.resolve(__dirname, 'src/hakit-addon-utils.tsx'),
      requiredVersion: false,
      singleton: true,
      shareScope: 'default',
      shareKey: '@hakit/addon/utils',
      packageName: '@hakit/addon/utils',
      version: '0.0.0',
      eager: true,
    },
  },
});

// ensure that every shared value on moduleFederationConfig that has moduleFederationConfig not as a boolean, is a string
if (moduleFederationConfig.shared) {
  for (const [key, value] of Object.entries(moduleFederationConfig.shared)) {
    if (typeof value.requiredVersion !== 'boolean') {
      if (typeof value.requiredVersion !== 'string') {
        throw new Error(
          `Shared value ${key} must be a string, got ${typeof value.requiredVersion}, "value": ${JSON.stringify(value.requiredVersion)}`
        );
      }
    }
  }
} else {
  throw new Error('Shared values are required');
}

export default moduleFederationConfig;
