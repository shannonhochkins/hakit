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
      '@measured/puck': {
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
    },
  };
}
