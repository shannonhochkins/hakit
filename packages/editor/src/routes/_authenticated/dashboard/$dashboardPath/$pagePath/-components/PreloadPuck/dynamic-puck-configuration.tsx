import React from 'react';
import { type UserConfig } from '@typings/puck';
import { DefaultComponentProps, DropZone } from '@measured/puck';
import { init, loadRemote, preloadRemote } from '@module-federation/enhanced/runtime';
import { type UserOptions } from '@module-federation/runtime-core';
import { createComponent, type ComponentFactoryData, type CustomComponentConfig } from '@lib/helpers/createComponent';

interface ComponentModule {
  default: CustomComponentConfig<DefaultComponentProps>;
}

export async function getPuckConfiguration(data: ComponentFactoryData) {
  const components: UserConfig['components'] = {};
  const rootConfigs: Array<UserConfig['root'] & { _remoteName?: string }> = [];
  const categories: NonNullable<UserConfig['categories']> = {} as NonNullable<UserConfig['categories']>;

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
        nameOrAlias: '@hakit/test',
      },
    ]);
    const snapshot = await host.snapshotHandler.getGlobalRemoteInfo(remote);
    if (!snapshot?.remoteSnapshot) {
      throw new Error('No manifest information found');
    }
    // type guard to ensure we have the correct type when iterating modules
    if ('publicPath' in snapshot.remoteSnapshot) {
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
          // add every root config to the list to render under one root
          // this could cause conflicts in the wild depending on the nature of the root components
          const rootConfigWithRemote = {
            ...(componentConfig as UserConfig['root']),
            _remoteName: remote.name, // track which remote this came from
          };
          rootConfigs.push(rootConfigWithRemote);
        } else {
          // it's the same reference to the same element, but just to make puck happy we'll create a new object
          // and cast it here to the correct type
          const customComponent = componentConfig as unknown as CustomComponentConfig<DefaultComponentProps>;
          const componentLabel = customComponent.label;
          components[componentLabel] = {
            ...componentConfig,
            // @ts-expect-error - we know this doesn't exist, it's fine.
            _remoteName: remote.name, // track which remote this came from
          };
          // we will use the :: as a delimiter to display the actual category/labels correctly
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
      fields: {},
      render(props) {
        return props.children;
      },
    });

    components['Test'] = {
      label: 'Test',
      fields: {},
      defaultProps: {},
      resolveFields: async () => ({}),
      render: props => <div ref={props.dragRef}>Test Component</div>,
    };
  }

  // Merge all root configurations
  const mergedRoot = mergeRootConfigurations(rootConfigs);

  const config: UserConfig = {
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
function mergeRootConfigurations(rootConfigs: Array<UserConfig['root'] & { _remoteName?: string }>): UserConfig['root'] {
  // Start with the first root config as base
  const baseConfig = rootConfigs[0];

  if (!baseConfig) {
    throw new Error('No root configurations provided');
  }

  // Merge all fields from all root configs, adding dividers between remotes
  const mergedFields: NonNullable<UserConfig['root']>['fields'] = {};

  rootConfigs.forEach((rootConfig, index) => {
    const remoteName = rootConfig._remoteName || `Remote ${index + 1}`;

    // Add divider before each remote's fields (except the first one)
    if (index > 0) {
      const dividerKey = `__divider_${remoteName}_${index}`;
      mergedFields[dividerKey] = createDividerField(remoteName);
    }

    // Add all fields from this root config
    if (rootConfig?.fields) {
      Object.entries(rootConfig.fields).forEach(([fieldKey, fieldValue]) => {
        // Prefix field keys with remote name to avoid conflicts
        const prefixedKey = `${remoteName}::${fieldKey}`;
        mergedFields[prefixedKey] = fieldValue;
      });
    }
  });

  // Create the merged root configuration
  const mergedRoot: UserConfig['root'] = {
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
              // Extract props that belong to this specific root config
              const rootProps = extractPropsForRoot(props, rootConfig._remoteName || `Remote ${index + 1}`);
              // Preserve the original puck context and editMode
              const mergedProps = {
                ...rootProps,
                id: props.id,
                puck: props.puck,
                dropZone: DropZone,
                editMode: props.editMode,
              };
              return (
                <React.Fragment key={rootConfig._remoteName || index}>{rootConfig.render(mergedProps as typeof props)}</React.Fragment>
              );
            }
            return null;
          })}
        </>
      );
    },
  };

  // Remove the temporary _remoteName property from the result
  const cleanedRoot = { ...mergedRoot };
  delete (cleanedRoot as typeof baseConfig)._remoteName;

  return cleanedRoot;
}

// Helper function to extract props that belong to a specific root
function extractPropsForRoot(allProps: Record<string, unknown>, remoteName: string) {
  // Extract only the props that belong to this remote
  const extractedProps: Record<string, unknown> = {};

  Object.entries(allProps).forEach(([key, value]) => {
    if (key.startsWith(`${remoteName}::`)) {
      // Remove the remote prefix to get the original field name
      const originalKey = key.replace(`${remoteName}::`, '');
      extractedProps[originalKey] = value;
    } else if (!key.includes('::') && !key.startsWith('__divider_')) {
      // Include non-prefixed props (likely from the base config)
      extractedProps[key] = value;
    }
  });

  return extractedProps;
}
