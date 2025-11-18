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
import { buttonComponentConfig } from '../Editor/InternalComponents/Button';

import { iconButtonComponentConfig } from '../Editor/InternalComponents/IconButton';
import { getLocalStorageItem, setLocalStorageItem } from '@hooks/useLocalStorage';
import { COMPONENT_TYPE_DELIMITER } from '@helpers/editor/pageData/constants';
import { toast } from 'react-toastify';

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

// Synthetic proxy remote so the MF Chrome extension can remap ANY remote URL to this placeholder.
// The extension can override its "entry" at runtime; we just need a stable name present early.
const PROXY_REMOTE_NAME = '@hakit/dev-remote-proxy';
const PROXY_BLANK_URL = 'http://fake.com/mf-manifest.json';

const EMPTY_CONTAINER = {
  get: (req: string) => Promise.reject(new Error(`[dev-proxy] no exposes for '${req}'`)),
  init: () => {},
};

// Put it on the global so 'global' type can find it
// @ts-expect-error - global augmentation not needed for this
window[PROXY_REMOTE_NAME] = EMPTY_CONTAINER; // or globalThis/self in workers

// simple check to see if the user has a chrome extension and proxying the dev proxy
export const getMockedProxies = () => {
  const localStorageValue = localStorage.getItem('__MF_DEVTOOLS__');
  // if it's here, attempt to parse as json
  try {
    if (localStorageValue) {
      const parsed = JSON.parse(localStorageValue) as {
        overrides: Record<string, string>;
      };
      if (parsed.overrides && parsed.overrides) return parsed.overrides;
    }
  } catch {
    // fail silently
  }
  return null;
};

const instance = getInstance() ?? createInstance({ name: 'host', remotes: [] });

instance.registerRemotes([
  {
    name: PROXY_REMOTE_NAME,
    version: '0.0.0', // RemoteWithVersion branch -> no network
    type: 'global', // look up on the global instead of fetching
    entryGlobalName: PROXY_REMOTE_NAME,
    shareScope: 'default',
  },
]);

// reset on load
setLocalStorageItem('proxied-components', {});

instance.registerPlugins([
  {
    name: 'capture-remote-entry',
    // Called before a container is initialized; receives the resolved info
    async beforeInitContainer(ctx) {
      // ctx.remoteInfo.version is the manifest url
      if (!resolvedEntryByName.has(ctx.remoteInfo.name)) {
        resolvedEntryByName.set(ctx.remoteInfo.name, ctx.remoteInfo.version ?? '');
      }
      return ctx;
    },
    async loadSnapshot(ctx) {
      if (ctx.moduleInfo.name === PROXY_REMOTE_NAME && !ctx.remoteSnapshot) {
        // minimal shape that satisfies the runtime
        return {
          ...ctx,
          remoteSnapshot: {
            // we just need to return a valid url here via a snapshot, doesn't matter as it won't actually be used
            remoteEntry: PROXY_BLANK_URL,
            version: '0.0.0',
          },
        };
      }
      // fall through for real remotes
      return ctx;
    },
    // async beforeLoadRemoteSnapshot(ctx) {
    //   if (ctx.moduleInfo.name !== PROXY_REMOTE_NAME) return ctx;
    //   return;
    // },
    // @ts-expect-error - This is a hack to supress errors with the runtime plugin fetching snapshots for something that
    // doesn't exist for the dev proxy only
    fetch(manifestUrl) {
      if (!manifestUrl?.includes(PROXY_BLANK_URL)) return; // let real remotes fetch as normal
      const stubManifest = {
        // minimal, but passes the runtime's assert and snapshot generator
        name: PROXY_REMOTE_NAME,
        version: '0.0.0',
        type: 'global',
        remoteEntry: PROXY_BLANK_URL, // url that does nothing
        metaData: {
          publicPath: '',
          remoteEntry: {
            // split the URL into path + name; joiner will do `${path}/${name}`
            path: location.origin,
            name: PROXY_BLANK_URL,
            type: 'global',
          },
          types: {
            path: '',
            name: '',
            zip: '',
            api: '',
          },
          buildInfo: { buildVersion: '0.0.0' },
          globalName: PROXY_REMOTE_NAME,
        },
        exposes: [], // array required; can be empty
        shared: [], // array required; can be empty
      };

      return new Response(JSON.stringify(stubManifest), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  },
]);

instance.registerPlugins([
  {
    name: 'pre-register',
    async errorLoadRemote(ctx) {
      try {
        const proxied = getMockedProxies();
        const match = proxied && Object.entries(proxied).find(([, entry]) => ctx.id === entry);
        if (match) {
          toast.error(
            `Failed to connect to remote "${match[0]}" via "${match[1]}". The Module Federation Devtools proxy may be misconfigured or the remote server is not running.`,
            {
              toastId: `mf-error-${match[0]}`,
              autoClose: false,
            }
          );
        }
      } catch {
        // fail silently
      }
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
  const proxies = getMockedProxies();
  const remotesWithOverrides = remotesToInit.map(r => {
    if (proxies && proxies[r.name]) {
      return {
        ...r,
        entry: proxies[r.name],
      };
    }
    return r;
  });
  // remove the proxy from this call as it's already registered
  instance.registerRemotes(remotesWithOverrides.filter(r => r.name !== PROXY_REMOTE_NAME));
  // Force-load a non-existent expose to trigger container init and fire beforeInitContainer
  await Promise.all(
    remotesWithOverrides.map(r => {
      return (
        instance
          .loadRemote(`${r.name}/__init__`, { from: 'runtime' })
          // this will always fail, this is just to pre-capture information from the remote
          .catch(() => null)
      );
    })
  );
}

async function hydrateLiveManifestsFromOverrides(resolved: Map<string, string>, targetMap: Map<string, MfManifest>) {
  await Promise.all(
    Array.from(resolved.entries()).map(async ([name, entryUrl]) => {
      try {
        const res = await fetch(entryUrl, { cache: 'no-store' });
        if (!res.ok) return;
        const manifest = (await res.json()) as MfManifest;
        targetMap.set(name, manifest);
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
  const componentType = customComponent.label + `${COMPONENT_TYPE_DELIMITER}${remote.addonId}`;
  if (!componentLabel?.trim()) {
    throw new Error(`Component from remote "${remote.name}" has no label`);
  }
  if (components[componentType]) {
    // @ts-expect-error - it does exist, see further down, intentionally not in the types to satisfy Puck
    const componentWithRemote = components[componentType]._remoteAddonName;
    console.warn(
      `Component "${componentType}" already exists, attempted to load from remote "${remote.name}", already loaded via "${componentWithRemote}", skipping this instance.`
    );
    return null;
  }
  components[componentType] = {
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
  categories[categoryLabel].components?.push(componentType);
}

export async function getPuckConfiguration(data: ComponentFactoryData): Promise<CustomPuckConfig<DefaultComponentProps>> {
  // reset when getting configuration
  setLocalStorageItem('proxied-components', {});
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
  const proxies = getMockedProxies();

  // Early resolve of effective remote entries and hydrate live manifests
  const preRemotes = buildPreRemotes(userAddons);
  // Always ensure proxy remote is included for early container init
  if (proxies && proxies[PROXY_REMOTE_NAME]) {
    // we force push the proxy remote if it's defined in the proxies
    resolvedEntryByName.set(PROXY_REMOTE_NAME, proxies[PROXY_REMOTE_NAME]);
    preRemotes.push({ name: PROXY_REMOTE_NAME, entry: proxies[PROXY_REMOTE_NAME], addonId: PROXY_REMOTE_NAME });
  }
  await initContainersEarly(preRemotes);
  await hydrateLiveManifestsFromOverrides(resolvedEntryByName, remoteManifest);

  const remotes: RemoteWithAddonId[] = await Promise.all(userAddons.map(userAddon => buildRemoteWithDbFallback(userAddon, remoteManifest)));

  // insert the dev proxy remote at the START to prioritize it, only when it's proxied
  if (proxies && proxies[PROXY_REMOTE_NAME]) {
    remotes.unshift({ name: PROXY_REMOTE_NAME, entry: proxies[PROXY_REMOTE_NAME], addonId: PROXY_REMOTE_NAME });
  }

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
    const isRemoteProxied = proxies && proxies[remote.name];
    // get the current local storage value, append all the exposed module name to the array
    try {
      const currentProxied = (JSON.parse(getLocalStorageItem('proxied-components') || '{}') ?? {}) as Record<string, string>;
      if (isRemoteProxied) {
        remoteManifest.get(remote.name); // ensure we have the manifest loaded
        remoteManifestData.exposes.forEach(module => {
          if (!currentProxied[`${module.name}${COMPONENT_TYPE_DELIMITER}${remote.addonId}`]) {
            currentProxied[`${module.name}${COMPONENT_TYPE_DELIMITER}${remote.addonId}`] = `${remote.name}/${module.name}`;
          }
        });
        setLocalStorageItem('proxied-components', currentProxied);
      }
    } catch (e) {
      console.error('Failed to parse proxied-components from localStorage', e);
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
          console.error(`Failed to load remote "${remote.name}" -> "${module.name}"`, e);
          console.error(`Likely issue is a react issue whilst rendering a component from an external package.`);
        });
      // If the remote fails to load above, we just continue as we don't want to crash the entire dashboard
      // because of this, it could be a local host remote that's not running or available
      if (!component) {
        continue;
      }

      const isRootComponent = component.config.rootConfiguration === true;

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
    {
      remote: {
        name: '@hakit/buttons',
        version: '0.0.0',
        addonId: '@hakit/buttons',
      },
      configs: [
        {
          config: buttonComponentConfig,
        },
        {
          config: iconButtonComponentConfig,
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
