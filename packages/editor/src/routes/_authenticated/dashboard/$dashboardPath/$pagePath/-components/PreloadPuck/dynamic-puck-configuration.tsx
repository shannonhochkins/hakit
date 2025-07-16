import React from 'react';
import { Config, DefaultComponentProps } from '@measured/puck';
import { init, loadRemote, preloadRemote } from '@module-federation/enhanced/runtime';
import { type UserOptions } from '@module-federation/runtime-core';
import { CustomConfig, type ComponentFactoryData, type CustomComponentConfig } from '@typings/puck';
import { createComponent } from './helpers/createPuckComponent';

interface ComponentModule {
  default: CustomComponentConfig<DefaultComponentProps>;
}

export async function getPuckConfiguration(data: ComponentFactoryData) {
  const components: Record<string, CustomComponentConfig<DefaultComponentProps>> = {};
  const rootConfigs: Array<CustomConfig['root'] & { _remoteName?: string }> = [];
  const categories: NonNullable<CustomConfig['categories']> = {} as NonNullable<Config['categories']>;

  const remotes: UserOptions['remotes'] = [
    {
      name: '@hakit/test',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
  ];

  const host = init({
    name: '@hakit/editor',
    remotes: remotes,
    shareStrategy: 'loaded-first',
  });

  for (const remote of remotes) {
    await preloadRemote([
      {
        nameOrAlias: remote.name,
      },
    ]);
    const snapshot = await host.snapshotHandler.getGlobalRemoteInfo(remote);
    if (!snapshot?.remoteSnapshot) {
      throw new Error('No manifest information found');
    }
    // type guard to ensure we have the correct type when iterating modules
    if ('getPublicPath' in snapshot.remoteSnapshot) {
      for (const module of snapshot.remoteSnapshot.modules) {
        const component = await loadRemote<ComponentModule>(`${remote.name}/${module.moduleName}`).then(loadedModule => {
          if (!loadedModule) {
            throw new Error(`No "${module.moduleName}" component found`);
          }
          return loadedModule.default;
        });
        const componentFactory = await createComponent(component);
        const componentConfig = await componentFactory(data);
        if (componentConfig.label === 'Root') {
          const rootConfig = componentConfig as CustomConfig['root'];
          // add every root config to the list to render under one root
          // this could cause conflicts in the wild depending on the nature of the root components
          const rootConfigWithRemote = {
            ...rootConfig,
            _remoteName: remote.name, // track which remote this came from
          };
          rootConfigs.push(rootConfigWithRemote);
        } else {
          // it's the same reference to the same element, but just to make puck happy we'll create a new object
          // and cast it here to the correct type
          const customComponent = componentConfig as unknown as CustomComponentConfig<DefaultComponentProps>;
          const componentLabel = customComponent.label;
          if (!componentLabel) {
            throw new Error(`Component from remote "${remote.name}" has no label`);
          }
          if (components[componentLabel]) {
            console.warn(`Component "${componentLabel}" already exists`);
            continue;
          }
          components[componentLabel] = {
            ...componentConfig,
            // @ts-expect-error - we know this doesn't exist, it's fine.
            _remoteName: remote.name, // track which remote this came from
          };
          const categoryLabel = remote.name;
          if (!categories[categoryLabel]) {
            categories[categoryLabel] = {
              title: categoryLabel,
              defaultExpanded: true,
              components: [],
            };
          }
          categories[categoryLabel].components?.push(componentLabel);
        }
      }
    }
  }

  if (rootConfigs.length === 0) {
    rootConfigs.push({
      label: 'Root',
      _remoteName: 'remote-default',
      fields: {},
      render(props) {
        return props.children;
      },
    });
  }

  // Merge all root configurations
  const mergedRoot = mergeRootConfigurations(rootConfigs);

  const config: CustomConfig = {
    components,
    categories,
    root: mergedRoot,
  };

  return config;
}

// Helper function to create a divider field
function createDividerField(remoteName: string) {
  return {
    type: 'custom' as const,
    render() {
      return (
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'var(--color-border)',
            margin: 'var(--space-2) 0',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--color-surface)',
              padding: '0 var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {remoteName}
          </div>
        </div>
      );
    },
  };
}

// Helper function to merge multiple root configurations
function mergeRootConfigurations(rootConfigs: Array<CustomConfig['root'] & { _remoteName?: string }>): CustomConfig['root'] {
  // Start with the first root config as base
  const baseConfig = rootConfigs[0];

  if (!baseConfig) {
    throw new Error('No root configurations provided');
  }

  // Merge all fields from all root configs, adding dividers between remotes
  let mergedFields: NonNullable<CustomConfig['root']>['fields'] = {};

  rootConfigs.forEach((rootConfig, index) => {
    const remoteName = rootConfig._remoteName || `Remote ${index + 1}`;
    mergedFields = {
      ...mergedFields,
      ...rootConfig.fields,
    };
    // Add divider before each remote's fields (except the first one)
    if (index > 0) {
      const dividerKey = `__divider_${remoteName}_${index}`;
      mergedFields[dividerKey] = createDividerField(remoteName);
    }
  });

  // Create the merged root configuration
  const mergedRoot: CustomConfig['root'] = {
    // Merge other properties from base config (excluding render and fields)
    ...Object.fromEntries(Object.entries(baseConfig || {}).filter(([key]) => key !== 'render' && key !== 'fields')),
    // Set the merged fields
    fields: mergedFields,
    // Create a render function that calls all root render functions
    render(props) {
      return (
        <>
          {rootConfigs.map((rootConfig, index) => {
            if (rootConfig?.render) {
              return <React.Fragment key={rootConfig._remoteName || index}>{rootConfig.render(props)}</React.Fragment>;
            }
            return null;
          })}
        </>
      );
    },
  };

  // Remove the temporary _remoteName property from the result as this is potentially multiple remotes
  // the object field wrapper will have the key of the remote name
  const cleanedRoot = { ...mergedRoot };
  delete (cleanedRoot as typeof baseConfig)._remoteName;

  return cleanedRoot;
}
