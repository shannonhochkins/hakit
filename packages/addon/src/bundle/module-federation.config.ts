import type { Manifest } from './types';
import type { PackageJson } from 'type-fest';
import type { moduleFederationPlugin } from '@module-federation/sdk';

type PluginOptions = moduleFederationPlugin.ModuleFederationPluginOptions;

export function createMFConfig(manifest: Manifest, packageJson: PackageJson): PluginOptions {
  // Convert package name to valid JavaScript identifier
  const federationName = packageJson.name?.replace(/[@/]/g, '_').replace(/-/g, '_');

  if (!federationName) {
    throw new Error('Package name is required in package.json');
  }

  // Create exposes object from manifest components
  const exposes: Record<string, string> = {};
  for (const component of manifest.components) {
    exposes[`./${component.name}`] = component.src;
  }

  return {
    name: federationName,
    library: { type: 'var', name: federationName },
    exposes,
    dts: false,
    shared: {
      react: {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      'react-dom': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      'react/jsx-runtime': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      'react/jsx-dev-runtime': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      '@hakit/core': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      '@hakit/components': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      '@emotion/react': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      'home-assistant-js-websocket': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      'lucide-react': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      zustand: {
        singleton: true,
        eager: false,
        requiredVersion: false,
        import: false,
      },
      '@hakit/addon/components': {
        import: false, // <— critical: do not include in remote bundle
        requiredVersion: false,
        singleton: true,
        shareScope: 'default',
        shareKey: '@hakit/addon/components',
        packageName: '@hakit/addon/components', // avoid tying to @hakit/addon package.json
      },
      '@hakit/addon/utils': {
        import: false, // <— critical: do not include in remote bundle
        requiredVersion: false,
        singleton: true,
        shareScope: 'default',
        shareKey: '@hakit/addon/utils',
        packageName: '@hakit/addon/utils', // avoid tying to @hakit/addon package.json
      },
    },
  };
}
