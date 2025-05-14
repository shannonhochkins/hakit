import { type UserConfig } from '@typings/puck';
import { ComponentConfig, DefaultComponentProps } from '@measured/puck';
import { init, loadRemote, preloadRemote } from '@module-federation/enhanced/runtime';
import { createComponent, type ComponentFactoryData, type CustomComponentConfig } from '@lib/helpers/createComponent';
import { CacheProvider } from '@emotion/react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';

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
            const test = componentConfig as unknown as CustomComponentConfig<DefaultComponentProps>;
            components[test.label as string] = test as unknown as ComponentConfig<DefaultComponentProps>;
            if (test.category) {
              if (!categories[test.category]) {
                categories[test.category] = {
                  title: test.category,
                  visible: test.category !== 'other',
                  defaultExpanded: test.category !== 'other',
                  components: [],
                };
              }
              categories[test.category].components?.push(test.label as string);
            }
          }
      }
    }
  }




  if (!rootConfig) {
    throw new Error('No "Root" component found');
  }

  const root: UserConfig['root'] = {
    ...rootConfig,
    render(props) {
      const emotionCache = useGlobalStore(state => state.emotionCache);
      return <CacheProvider value={emotionCache ?? null}>
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
