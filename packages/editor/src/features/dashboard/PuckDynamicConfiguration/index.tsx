import { Config, DefaultComponentProps } from '@measured/puck';
import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import { type UserOptions } from '@module-federation/runtime-core';
import {
  CustomComponentConfigWithDefinition,
  CustomConfigWithDefinition,
  type ComponentFactoryData,
  type CustomComponentConfig,
} from '@typings/puck';
import { createComponent } from '@helpers/editor/createPuckComponent';
import { getUserRepositories } from '@services/repositories';
import { MfManifest } from '@server/routes/repositories/validate-zip';
import { createRootComponent } from '@helpers/editor/createRootComponent';

interface ComponentModule {
  config: CustomComponentConfig<DefaultComponentProps>;
}

export type CustomRootConfigWithRemote<P extends DefaultComponentProps = DefaultComponentProps> = CustomComponentConfig<P> & {
  _remoteRepositoryId: string; // remote id for tracking
  _remoteRepositoryName: string; // remote name for tracking
};

type Remote = UserOptions['remotes'][number];

type RemoteWithRepositoryId = Remote & {
  repositoryId: string; // Add repositoryId to Remote type
};

export async function getPuckConfiguration(data: ComponentFactoryData) {
  const components: Record<string, CustomComponentConfigWithDefinition<DefaultComponentProps>> = {};
  const rootConfigs: Array<CustomRootConfigWithRemote> = [];
  const categories: NonNullable<CustomConfigWithDefinition['categories']> = {} as NonNullable<Config['categories']>;
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
  const remotes: RemoteWithRepositoryId[] = await Promise.all(
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
          repositoryId: userRepo.repository.id, // Add repository ID for tracking
        };
      } catch (error) {
        console.error(`Failed to fetch manifest for remote ${userRepo.repository.name}:`, error);

        return {
          name: userRepo.repository.name,
          entry: manifestUrl,
          repositoryId: userRepo.repository.id, // Add repository ID for tracking
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
        continue;
      }

      // load the module contents from the current instance
      const component = await loadRemote<ComponentModule>(`${remote.name}/${module.name}`).then(loadedModule => {
        if (!loadedModule) {
          throw new Error(`No "${module.name}" component found`);
        }
        return loadedModule;
      });
      const isRootComponent = component.config.label === 'Root';

      if (isRootComponent) {
        // for now, we just capture the rootConfigs as we need to render them under one root
        // we need to restructure them to support this
        rootConfigs.push({
          ...component.config,
          _remoteRepositoryName: remote.name, // track which remote this came from
          _remoteRepositoryId: remote.repositoryId, // track which remote this came from
        });
      } else {
        // create the puck definitions
        const componentFactory = await createComponent(component.config);
        // use our component factory to convert out component structure to a puck component
        const componentConfig = await componentFactory(data);
        // it's the same reference to the same element, but just to make puck happy we'll create a new object
        // and cast it here to the correct type
        const customComponent = componentConfig;
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
          _remoteRepositoryName: remote.name, // track which remote this came from
          _remoteRepositoryId: remote.name, // track which remote this came from
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
  // generate the merged root configuration
  const rootConfig = await createRootComponent(rootConfigs, data);
  // create the puck definitions
  const config: CustomConfigWithDefinition<DefaultComponentProps> = {
    components,
    categories,
    // @ts-expect-error - doesn't contain internal fields in the typings at this level
    root: rootConfig,
  };

  return config;
}
