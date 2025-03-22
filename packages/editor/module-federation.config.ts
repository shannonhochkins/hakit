import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { dependencies } from "./package.json";

export default createModuleFederationConfig({
  name: 'editor',
  remotes: {
    // 'provider': 'rslib_provider@https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json',
  },
  shared: {
    react: {
      singleton: true,
      eager: true,
      requiredVersion: dependencies.react,
    },
    'react-dom': {
      singleton: true,
      eager: true,
      requiredVersion: dependencies['react-dom'],
    },
    '@hakit/core': {
      singleton: true,
      eager: true,
      requiredVersion: dependencies['@hakit/core'],
    },
    '@hakit/components': {
      singleton: true,
      eager: true,
      requiredVersion: dependencies['@hakit/components'],
    },
    '@measured/puck': {
      singleton: true,
      eager: true,
      requiredVersion: dependencies['@measured/puck'],
    },
    // '@emotion/react': {
    //   singleton: true,
    //   eager: true,
    //   requiredVersion: dependencies['@emotion/react'],
    // }
  },
});
