import { type UserConfig } from '@typings/puck';
import { ComponentFactoryData, CustomComponentConfig } from '../components';
import { ComponentConfig, DefaultComponentProps } from '@measured/puck';
import { createComponent } from '@editor/components';
import { getComponentsForUser } from '../../api/component';
import { useFederation } from '../fed';

interface ComponentModule {
  default: (data: ComponentFactoryData) => Promise<CustomComponentConfig<DefaultComponentProps>>;
}

export async function getPuckConfiguration(data: ComponentFactoryData) {
  // const modules = import.meta.glob<ComponentModule>('../components/*/index.tsx');
  const components: UserConfig['components'] = {};
  let rootConfig: UserConfig['root'] | undefined;
  const categories: NonNullable<UserConfig['categories']> = {} as NonNullable<UserConfig['categories']>;
  const { getComponent, setModule } = useFederation();
  // // Each key in `modules` is a file path, and the value is an async import function.
  // // You can then iterate and invoke each import as needed, for example:
  // for (const path in modules) {
  //   const { default: componentFactory } = await modules[path]();
  //   const config = await componentFactory(data);
  //   if ('label' in config && typeof config.label === 'string') {
  //     if (config.label === 'Root') {
  //       rootConfig = config as unknown as UserConfig['root'];
  //     } else {
  //       // components[config.label] = config as ComponentConfig;
  //       // if (config.category) {
  //       //   if (!categories[config.category]) {
  //       //     categories[config.category] = {
  //       //       title: config.category,
  //       //       visible: config.category !== 'other',
  //       //       defaultExpanded: config.category !== 'other',
  //       //       components: [],
  //       //     };
  //       //   }
  //       //   categories[config.category].components?.push(config.label);
  //       // }
  //     }
  //   } else {
  //     throw new Error(`No "label" found in component config at path: ${path}`);
  //   }
  // }
  // const mod = await fetch(`/api/asset/plugins/test/remoteEntry.js`);
  // const url = await mod.json();
  // console.log('url', url);
  try {
    const dev = true;
    const url = dev ? 'http://localhost:5001/assets/remoteEntry.js' : '/api/asset/plugins/assets/remoteEntry.js';
    setModule('Theme', url);
    const componentsToLoad = ['Root', 'Background', 'Navigation', 'Layout', 'Slider'];
    for (const componentName of componentsToLoad) {
      const component = await getComponent('Theme', componentName);
      console.log('component', component);
      const componentFactory = await createComponent(component);
      const componentConfig = await componentFactory(data);
      if (componentConfig.label === 'Root') {
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
  } catch (e) {
    console.error(e);
  }

  // const dynamicComponents = await getComponentsForUser();
  // for (const component of dynamicComponents.components) {
  //   const mod = await import(`/api/asset/${component.objectKey}`).then(m => m.default);
  //   const componentFactory = await createComponent(mod);
  //   const componentConfig = await componentFactory(data);
  //   components[componentConfig.label as string] = componentConfig as ComponentConfig;
  //   if (componentConfig.category) {
  //     if (!categories[componentConfig.category]) {
  //       categories[componentConfig.category] = {
  //         title: componentConfig.category,
  //         visible: componentConfig.category !== 'other',
  //         defaultExpanded: componentConfig.category !== 'other',
  //         components: [],
  //       };
  //     }
  //     categories[componentConfig.category].components?.push(componentConfig.label as string);
  
  //   }
  // }

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
