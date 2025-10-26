import { Config, DefaultComponentProps } from '@measured/puck';
import { getInstance, createInstance } from '@module-federation/enhanced/runtime';
import { type UserOptions } from '@module-federation/runtime-core';
import { CustomComponentConfig, CustomPuckComponentConfig, CustomPuckConfig, type ComponentFactoryData } from '@typings/puck';
import { createComponent } from '@features/dashboard/Editor/createPuckComponent';
import { getUserAddons } from '@services/addons';
import { MfManifest } from '@server/routes/addons/validate-zip';
import { createRootComponent } from '@features/dashboard/Editor/createRootComponent';
// import the internal components
import { popupComponentConfig } from '@features/dashboard/Editor/InternalComponents/Popup';
import { containerComponentConfig } from '@features/dashboard/Editor/InternalComponents/Container';

interface ComponentModule {
  config: CustomPuckComponentConfig<DefaultComponentProps>;
}

export type CustomRootConfigWithRemote<P extends DefaultComponentProps = DefaultComponentProps> = CustomPuckComponentConfig<P> & {
  _remoteAddonId: string; // remote id for tracking
  _remoteAddonName: string; // remote name for tracking
};

type Remote = UserOptions['remotes'][number];

type RemoteWithAddonId = Remote & {
  addonId: string; // Add addonId to Remote type
};

const resolvedEntryByName = new Map<string, string>();

const instance = getInstance() ?? createInstance({ name: 'host', remotes: [] });

instance.registerPlugins([
  {
    name: 'capture-remote-entry',
    // Called before a container is initialized; receives the resolved info
    async beforeInitContainer(ctx) {
      // ctx.remoteInfo.version is the manifest url
      resolvedEntryByName.set(ctx.remoteInfo.name, ctx.remoteInfo.version ?? '');
      return ctx;
    },
  },
]);

// -------------------------
// Helpers to reduce duplication
// -------------------------
type UserAddon = Awaited<ReturnType<typeof getUserAddons>>[number];

function buildPreRemotes(userAddons: UserAddon[]): Array<RemoteWithAddonId> {
  return userAddons.map(userAddon => ({
    name: userAddon.addon.name,
    entry: userAddon.version.manifestUrl,
    addonId: userAddon.addon.id,
  }));
}

async function initContainersEarly(remotesToInit: Array<RemoteWithAddonId>) {
  // Ensure the runtime knows about these remotes
  instance.registerRemotes(remotesToInit);
  // Force-load a non-existent expose to trigger container init and fire beforeInitContainer
  await Promise.all(remotesToInit.map(r => instance.loadRemote(`${r.name}/__init__`, { from: 'runtime' }).catch(() => null)));
}

async function hydrateLiveManifestsFromOverrides(resolved: Map<string, string>, targetMap: Map<string, MfManifest>) {
  await Promise.all(
    Array.from(resolved.entries()).map(async ([name, entryUrl]) => {
      try {
        const res = await fetch(entryUrl, { cache: 'no-store' });
        if (!res.ok) return;
        targetMap.set(name, (await res.json()) as MfManifest);
      } catch (e) {
        console.debug(`Failed to fetch live manifest for ${name}`, e);
      }
    })
  );
}

async function buildRemoteWithDbFallback(userAddon: UserAddon, manifestCache: Map<string, MfManifest>): Promise<RemoteWithAddonId> {
  const manifestUrl = userAddon.version.manifestUrl;

  if (!manifestCache.has(userAddon.addon.name)) {
    try {
      const manifestResponse = await fetch(manifestUrl);
      if (manifestResponse.ok) {
        manifestCache.set(userAddon.addon.name, (await manifestResponse.json()) as MfManifest);
      }
    } catch (error) {
      console.error(`Failed to fetch manifest for remote ${userAddon.addon.name}:`, error);
    }
  }

  return {
    name: userAddon.addon.name,
    entry: manifestUrl,
    addonId: userAddon.addon.id,
  };
}

async function processComponent<P extends object>({
  config,
  components,
  remote,
  data,
  categories,
  visible,
}: {
  config: CustomComponentConfig<P>;
  components: Record<string, CustomPuckComponentConfig<DefaultComponentProps>>;
  remote: RemoteWithAddonId;
  data: ComponentFactoryData;
  categories: NonNullable<Config['categories']>;
  visible?: boolean;
}) {
  // create the puck definitions
  const componentFactory = await createComponent(config);
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
    // TODO - Potentially prefix component label with a UID and then trim for display?
    console.warn(`Component "${componentLabel}" already exists`);
    return null;
  }
  components[componentLabel] = {
    ...componentConfig,
    // @ts-expect-error - we know this doesn't exist, it's fine.
    _remoteAddonName: remote.name, // track which remote this came from
    _remoteAddonId: remote.name, // track which remote this came from
  };
  const categoryLabel = remote.name;
  if (!categories[categoryLabel]) {
    categories[categoryLabel] = {
      title: categoryLabel,
      ...(visible !== false
        ? {
            defaultExpanded: true,
            components: [],
          }
        : { visible: false, components: [] }),
    };
  }
  categories[categoryLabel].components?.push(componentLabel);
}

export async function getPuckConfiguration(data: ComponentFactoryData): Promise<CustomPuckConfig<DefaultComponentProps>> {
  const components: Record<string, CustomPuckComponentConfig<DefaultComponentProps>> = {};
  const rootConfigs: Array<CustomRootConfigWithRemote> = [];
  const categories: NonNullable<Config['categories']> = {};
  const userAddons = await getUserAddons();
  const remoteManifest = new Map<string, MfManifest>();
  // Create a map of excluded components by addon name
  const excludedComponents = new Map<string, Set<string>>();

  // Process user preferences to build excluded components list
  userAddons.forEach(userAddon => {
    const excludedForAddon = new Set<string>();
    userAddon.version.components.forEach(component => {
      if (!component.enabled) {
        excludedForAddon.add(component.name);
      }
    });
    if (excludedForAddon.size > 0) {
      excludedComponents.set(userAddon.addon.name, excludedForAddon);
    }
  });

  // Early resolve of effective remote entries and hydrate live manifests
  const preRemotes = buildPreRemotes(userAddons);
  await initContainersEarly(preRemotes);
  await hydrateLiveManifestsFromOverrides(resolvedEntryByName, remoteManifest);

  const remotes: RemoteWithAddonId[] = await Promise.all(userAddons.map(userAddon => buildRemoteWithDbFallback(userAddon, remoteManifest)));

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
      const excludedForAddon = excludedComponents.get(remote.name);
      if (excludedForAddon && excludedForAddon.has(module.name)) {
        continue;
      }
      // load the module contents from the current instance
      const component = await instance
        .loadRemote<ComponentModule>(`${remote.name}/${module.name}`, {
          from: 'runtime',
        })
        .then(loadedModule => {
          if (!loadedModule) {
            throw new Error(`No "${module.name}" component found`);
          }
          return loadedModule;
        })
        .catch(e => {
          console.error(`Failed to load remote "${remote.name}"`, e);
        });
      // If the remote fails to load above, we just continue as we don't want to crash the entire dashboard
      // because of this, it could be a local host remote that's not running or available
      if (!component) {
        continue;
      }

      const isRootComponent = component.config.label === 'Root';

      if (isRootComponent) {
        // for now, we just capture the rootConfigs as we need to render them under one root
        // we need to restructure them to support this
        rootConfigs.push({
          ...component.config,
          _remoteAddonName: remote.name, // track which remote this came from
          _remoteAddonId: remote.addonId, // track which remote this came from
        });
      } else {
        processComponent({
          config: component.config,
          components,
          remote,
          data,
          categories,
        });
      }
    }
  }

  const internalComponents: {
    remote: RemoteWithAddonId;
    configs: {
      // we just want it to expect any component config, this is fine here
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: CustomComponentConfig<any>;
      /**
       * Whether the component is hidden from the UI (invisible component)
       */
      visible?: boolean;
    }[];
  }[] = [
    {
      remote: {
        name: '@hakit/internal-hidden',
        version: '0.0.0',
        addonId: '@hakit/internal-hidden',
      },
      configs: [
        {
          config: popupComponentConfig,
          visible: false,
        },
      ],
    },
    {
      remote: {
        name: '@hakit/layout',
        version: '0.0.0',
        addonId: '@hakit/layout',
      },
      configs: [
        {
          config: containerComponentConfig,
        },
      ],
    },
  ];

  internalComponents.forEach(({ remote, configs }) => {
    configs.forEach(config => {
      processComponent({
        config: config.config,
        components,
        remote,
        data,
        categories,
        visible: config.visible,
      });
    });
  });
  // for some reason, we need to mark "other" as visible false to hide other categories
  categories['other'] = {
    title: 'Other',
    visible: false,
  };

  // generate the merged root configuration
  const rootConfig = await createRootComponent(rootConfigs, data);
  // create the puck definitions
  const config: CustomPuckConfig<DefaultComponentProps> = {
    components,
    categories,
    // @ts-expect-error - We know the shape is technically incorrect here, but it's okay.
    root: rootConfig,
  };

  return config;
}
