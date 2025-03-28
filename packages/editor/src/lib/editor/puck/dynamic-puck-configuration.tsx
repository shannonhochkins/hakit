import { type UserConfig } from '@typings/puck';
import { ComponentConfig, DefaultComponentProps } from '@measured/puck';
import { init, loadRemote, preloadRemote } from '@module-federation/enhanced/runtime';
import { createComponent, type ComponentFactoryData, type CustomComponentConfig } from './createComponent';
import { CacheProvider, withEmotionCache } from '@emotion/react';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';

interface ComponentModule {
  default: CustomComponentConfig<DefaultComponentProps>;
}

export async function getPuckConfiguration(data: ComponentFactoryData) {
  const components: UserConfig['components'] = {};
  let rootConfig: UserConfig['root'] | undefined;
  const categories: NonNullable<UserConfig['categories']> = {} as NonNullable<UserConfig['categories']>;

  const remotes = [
    {
      name: '@hakit/test',
      entry: 'http://localhost:3001/mf-manifest.json',
    }
  ]

  const host = init({
    name: '@hakit/editor',
    remotes: remotes,
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
        const component = await loadRemote<ComponentModule>(`${remote.name}/${module.moduleName}`)
          .then(loadedModule => {
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


  if (!rootConfig) {
    throw new Error('No "Root" component found');
  }
  const root = {
    ...rootConfig,
    render(props) {
      const emotionCache = useGlobalStore(state => state.emotionCache);
      if (!emotionCache) {
        return <div>Loading emotion cache...</div>;
      }
      console.log('rendering rot', emotionCache)
      return <CacheProvider value={emotionCache}>
        {rootConfig?.render?.(props) ?? null}
      </CacheProvider>
    }
  }
  const config: UserConfig = {
    components,
    categories,
    root,
  };

  return config;
}
