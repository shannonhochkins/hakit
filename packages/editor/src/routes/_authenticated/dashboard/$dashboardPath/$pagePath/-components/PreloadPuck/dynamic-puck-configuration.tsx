import React from 'react';
import { Config, DefaultComponentProps } from '@measured/puck';
import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import { type UserOptions } from '@module-federation/runtime-core';
import { CustomConfig, type ComponentFactoryData, type CustomComponentConfig } from '@typings/puck';
import { createComponent } from './helpers/createPuckComponent';
import { getUserRepositories } from '@lib/api/components';
import { MfManifest } from '@server/routes/components/validate-zip';

interface ComponentModule {
  config: Omit<CustomComponentConfig<DefaultComponentProps>, 'render'>;
  Render: CustomComponentConfig<DefaultComponentProps>['render'];
}

export async function getPuckConfiguration(data: ComponentFactoryData) {
  const components: Record<string, CustomComponentConfig<DefaultComponentProps>> = {};
  const rootConfigs: Array<CustomConfig['root'] & { _remoteName?: string }> = [];
  const categories: NonNullable<CustomConfig['categories']> = {} as NonNullable<Config['categories']>;
  const userRepositories = await getUserRepositories();
  const remoteManifest = new Map<string, MfManifest>();
  // Create a map of excluded components by repository name
  const excludedComponents = new Map<string, Set<string>>();

  // Process user preferences to build excluded components list
  userRepositories.forEach(userRepo => {
    const excludedForRepo = new Set<string>();
    userRepo.version.components.forEach(component => {
      if (!component.enabled) {
        excludedForRepo.add(component.name);
      }
    });
    if (excludedForRepo.size > 0) {
      excludedComponents.set(userRepo.repository.name, excludedForRepo);
    }
  });

  // Process all remotes asynchronously and get all the manifest files content
  const remotes: UserOptions['remotes'] = await Promise.all(
    userRepositories.map(async userRepo => {
      const manifestUrl = userRepo.version.manifestUrl;
      try {
        // Fetch the manifest to get publicPathVar and remoteEntry info
        const manifestResponse = await fetch(manifestUrl);
        if (!manifestResponse.ok) {
          throw new Error(`Failed to fetch manifest: ${manifestResponse.status} ${manifestResponse.statusText}`);
        }

        const manifest = (await manifestResponse.json()) as MfManifest;
        // Store base path for the plugin
        remoteManifest.set(userRepo.repository.name, manifest);
        return {
          name: userRepo.repository.name,
          entry: manifestUrl, // Use the actual JS entry file, not the manifest
        };
      } catch (error) {
        console.error(`Failed to fetch manifest for remote ${userRepo.repository.name}:`, error);

        return {
          name: userRepo.repository.name,
          entry: manifestUrl,
        };
      }
    })
  );

  // tell the instance about all the dynamic remotes
  // this will allow us to load the remotes dynamically at runtime
  registerRemotes(remotes);

  for (const remote of remotes) {
    const remoteManifestData = remoteManifest.get(remote.name);
    if (!remoteManifestData) {
      console.warn(`No manifest data found for remote "${remote.name}"`);
      continue;
    }
    // type guard to ensure we have the correct type when iterating modules
    if (!remoteManifestData.metaData.publicPath) {
      console.warn(`Remote "${remote.name}" does not have publicPath defined in manifest metaData`);
      continue;
    }
    for (const module of remoteManifestData.exposes) {
      // Skip loading components that are disabled in user preferences
      const excludedForRepo = excludedComponents.get(remote.name);
      if (excludedForRepo && excludedForRepo.has(module.name)) {
        console.log(`Skipping disabled component "${module.name}" from remote "${remote.name}"`);
        continue;
      }

      // load the module contents from the current instance
      const component = await loadRemote<ComponentModule>(`${remote.name}/${module.name}`).then(loadedModule => {
        if (!loadedModule) {
          throw new Error(`No "${module.name}" component found`);
        }
        return loadedModule;
      });
      // create the puck definitions
      const componentFactory = await createComponent({
        ...component.config,
        render: component.Render,
      });
      // use our component factory to convert out component structure to a puck component
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
