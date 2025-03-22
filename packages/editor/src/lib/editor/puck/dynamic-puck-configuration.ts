import { type UserConfig } from '@typings/puck';
import { ComponentFactoryData, CustomComponentConfig } from '../components';
import { ComponentConfig, DefaultComponentProps } from '@measured/puck';
import { init, loadRemote, preloadRemote, registerPlugins } from '@module-federation/enhanced/runtime';

import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { createComponent } from './createComponent';

interface RemotePlugin {
  name: string;
  exposes: {
    moduleName: string;
    modulePath?: string;
  }
}



// const runtimePlugin: () => FederationRuntimePlugin = function () {
//   return {
//     name: 'generate-dynamic-component-list',
//     async generatePreloadAssets(args) {
//       console.log('generatePreloadAssets:', args);
//       // this is the only way i was able to find the remote information
//       // before actually loading it
//       return {
//         cssAssets: [],
//         jsAssetsWithoutEntry: [],
//         entryAssets: [],
//       }
//     },
//   };
// };
// registerPlugins([runtimePlugin()]);

// import { createComponent } from '@editor/components';
// import { getComponentsForUser } from '../../api/component';
// import { useFederation } from '../fed';
// import { init, loadRemote } from '@module-federation/enhanced/runtime';


interface ComponentModule {
  default: (data: ComponentFactoryData) => Promise<CustomComponentConfig<DefaultComponentProps>>;
}

export async function getPuckConfiguration(data: ComponentFactoryData) {
  const remotePlugins: RemotePlugin[] = [];
  // const modules = import.meta.glob<ComponentModule>('../components/*/index.tsx');
  const components: UserConfig['components'] = {};
  let rootConfig: UserConfig['root'] | undefined;
  const categories: NonNullable<UserConfig['categories']> = {} as NonNullable<UserConfig['categories']>;
  // THIS DOESN"T WORK, need the manifest after preload somehow
  // const remotePlugin: () => FederationRuntimePlugin = function () {
  //   return {
  //     name: 'generate-dynamic-component-list',
  //     async generatePreloadAssets(args) {
  //       // forces types to use ConsumerModuleInfo with this guard
  //       if ('publicPath' in args.remoteSnapshot) {
  //         console.log('x')
  //         remotes.push({
  //           name: args.remote.name,
  //           exposes: args.remoteSnapshot.modules.map(mod => ({
  //             moduleName: mod.moduleName,
  //             modulePath: mod.modulePath
  //           }))
  //         });
  //       }
  //       // this is the only way i was able to find the remote information
  //       // before actually loading it
  //       return {
  //         cssAssets: [],
  //         jsAssetsWithoutEntry: [],
  //         entryAssets: [],
  //       }
  //     },
  //   };
  // };

  const remotes = [
    {
      name: '@hakit/test',
      entry: 'http://localhost:3001/mf-manifest.json',
    }
  ]


  const host = init({
    name: '@hakit/editor',
    remotes: remotes,
    // plugins: [remotePlugin()],
    shareStrategy: 'loaded-first',
  });

  for (const remote of remotes) {
    await preloadRemote([{
      nameOrAlias: '@hakit/test',
    }]);
    const snapshot = await host.snapshotHandler.getGlobalRemoteInfo(remote);
    if (!snapshot?.remoteSnapshot) {
      throw new Error('No manifest information found');
    }
    // type guard to ensure we have the correct type when iterating modules
    if ('publicPath' in snapshot.remoteSnapshot) {
      for (const module of snapshot.remoteSnapshot.modules) {
        const component = await loadRemote<{
          default: CustomComponentConfig<DefaultComponentProps>;
        }>(`${remote.name}/${module.moduleName}`).then(loadedModule => {
          if (!loadedModule) {
            throw new Error(`No "${module.moduleName}" component found`);
          }
          return loadedModule.default;
        });
          const componentFactory = await createComponent(component);
          const componentConfig = await componentFactory(data);
          if (componentConfig.label === 'Root') {
            if (typeof rootConfig !== 'undefined') {
              throw new Error('Multiple "Root" components found');
            }
            rootConfig = componentConfig as unknown as UserConfig['root'];
          } else {
            components[componentConfig.label as string] = componentConfig as ComponentConfig;
            if (componentConfig.category) {
              if (!categories[componentConfig.category]) {
                categories[componentConfig.category] = {
                  title: componentConfig.category,
                  visible: componentConfig.category !== 'other',
                  defaultExpanded: componentConfig.category !== 'other',
                  components: [],
                };
              }
              categories[componentConfig.category].components?.push(componentConfig.label as string);
            }
          }
      }
    }
  }

  console.log('components', components);

  // const componentsToLoad = ['Root', 'Background', 'Navigation'];
  // for (const componentName of componentsToLoad) {
  //   const component = await loadRemote<{
  //     default: CustomComponentConfig<DefaultComponentProps>;
  //   }>(`@hakit/test/${componentName}`).then(module => {
  //     if (!module) {
  //       throw new Error(`No "${componentName}" component found`);
  //     }
  //     return module.default;
  //   });
  //   const componentFactory = await createComponent(component);
  //   const componentConfig = await componentFactory(data);
  //   if (componentConfig.label === 'Root') {
  //     rootConfig = componentConfig as unknown as UserConfig['root'];
  //   } else {
  //     components[componentConfig.label as string] = componentConfig as ComponentConfig;
  //     if (componentConfig.category) {
  //       if (!categories[componentConfig.category]) {
  //         categories[componentConfig.category] = {
  //           title: componentConfig.category,
  //           visible: componentConfig.category !== 'other',
  //           defaultExpanded: componentConfig.category !== 'other',
  //           components: [],
  //         };
  //       }
  //       categories[componentConfig.category].components?.push(componentConfig.label as string);
  //     }
  //   }
  // }

  // console.log('components', rootConfig, components);


  if (!rootConfig) {
    throw new Error('No "Root" component found');
  }
  const config: UserConfig = {
    components,
    categories,
    root: rootConfig,
  };

  return config;
}
