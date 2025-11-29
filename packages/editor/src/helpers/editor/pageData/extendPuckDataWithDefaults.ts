import { CustomPuckConfig, PuckPageData } from '@typings/puck';
import { ComponentData, DefaultComponentProps } from '@measured/puck';
import { merge } from 'ts-deepmerge';
import { unsafelyDeepClone } from '@helpers/deepClone';
/**
 * Extends PuckPageData with missing default properties from userConfig.defaultProps.
 * This should be called AFTER dbValueToPuck since that removes breakpoint keys.
 * Uses deepmerge to merge defaults (base) with existing data (overlay).
 *
 * Example of dataset
 *
 * {
 *    content: [], // this is an array of component data
 *    root: {
 *      content: [], // this is an array of component data
 *      props: {
 *        content: [{
 *          type: 'TestComponent',
 *          props: {
 *            title: 'Test',
 *            content: [{
 *              type: 'TestComponent',
 *              props: {
 *                title: 'Test',
 *              },
 *            }], // this is an array of component data,
 *          },
 *        }], // this is an array of component data,
 *        '@hakit/default-root': {
 *          background: {
 *            useBackgroundImage: true,
 *          },
 *        },
 *      },
 *    },
 *    zones: {},
 * }
 *
 * @param data - The PuckPageData to extend (after dbValueToPuck processing)
 * @param userConfig - The user configuration containing defaultProps
 * @returns Extended PuckPageData with missing default properties added
 */

function isContentArray(value: unknown): value is ComponentData[] {
  return Array.isArray(value) && value.every(item => item !== null && typeof item === 'object' && 'type' in item && 'props' in item);
}

type InternalDataOverride = {
  root: {
    content: ComponentData[];
    props: Omit<ComponentData['props'], 'id'>;
  };
  content: ComponentData[];
  zones: Record<string, ComponentData[]>;
};

export function extendPuckDataWithDefaults<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  IsRoot extends boolean | undefined = undefined,
>(inputData: PuckPageData, userConfig: CustomPuckConfig<Props, RootProps, IsRoot>): PuckPageData {
  const defaultProps = userConfig.root?.defaultProps;
  const data = inputData as InternalDataOverride;

  if (!defaultProps) return data;

  // Deep clone to avoid mutations - create a completely new structure
  // Clone zones with new arrays to avoid shared references
  const clonedZones: Record<string, ComponentData[]> = {};
  if (data.zones) {
    for (const [zoneName, zoneContent] of Object.entries(data.zones)) {
      clonedZones[zoneName] = Array.isArray(zoneContent) ? [...zoneContent] : [];
    }
  }

  const extendedData: InternalDataOverride = {
    root: data.root
      ? {
          ...data.root,
          props: {
            content: [],
          }, // Start with empty props, will populate below
          content: data.root.content ? [...data.root.content] : [],
        }
      : {
          content: [],
          props: {
            content: [],
          },
        },
    content: data.content ? [...data.content] : [],
    zones: clonedZones,
  };

  // Extend root props with defaults
  if (defaultProps && data.root?.props) {
    // Build new root props from scratch to avoid any shared references
    const newRootProps: Omit<ComponentData['props'], 'id'> = {
      content: [],
    };

    // First, deep clone all existing props that aren't in defaults
    for (const [key, value] of Object.entries(data.root.props)) {
      if (!(key in defaultProps)) {
        // Property not in defaults, deep clone it to avoid mutation
        newRootProps[key] = typeof value === 'object' && value !== null ? unsafelyDeepClone(value) : value;
      }
    }

    // Then merge defaults with existing values, root props are stored by remote id as the key, then the props
    for (const [remoteId, remoteDefaults] of Object.entries(defaultProps as Record<string, DefaultComponentProps>)) {
      // Check if the remoteId exists in the current root props, and we're not actually an array
      if (remoteId in data.root.props && typeof data.root.props[remoteId] === 'object') {
        // Remote exists, deep merge defaults (base) with existing data (overlay)
        // merge creates a new object, so this is safe
        if (Array.isArray(data.root.props[remoteId]) && Array.isArray(remoteDefaults)) {
          // If both are arrays, return the data array first, else the defaults
          newRootProps[remoteId] = data.root.props[remoteId].length > 0 ? data.root.props[remoteId] : remoteDefaults;
        } else {
          newRootProps[remoteId] = merge(remoteDefaults, data.root.props[remoteId]);
        }
      } else {
        // Remote doesn't exist, use defaults as-is
        newRootProps[remoteId] = remoteDefaults;
      }
    }

    extendedData.root.props = newRootProps;
  } else if (data.root?.props) {
    // No defaults, but we still need to deep clone to avoid mutations
    extendedData.root.props = unsafelyDeepClone(data.root.props);
  }

  // Helper function to recursively extend a component item with default props
  const extendComponentItem = (item: ComponentData): ComponentData => {
    const componentConfig = userConfig.components?.[item.type];

    if (!componentConfig?.defaultProps) {
      // No defaults, but we still need to clone to avoid mutations
      // Deep clone the props to ensure no shared references
      return {
        ...item,
        props: item.props ? unsafelyDeepClone(item.props) : { id: 'unknown-id' },
      };
    }

    // Deep merge defaults (base) with existing component props (overlay)
    // merge() creates a new object, so this is safe
    const extendedProps = merge(componentConfig.defaultProps, item.props || { id: 'unknown-id' });

    // Recursively process any nested content arrays
    const processedProps = { ...extendedProps };

    // Check if this component has a content array (slot field)
    if (isContentArray(processedProps.content)) {
      processedProps.content = processedProps.content.map(extendComponentItem);
    }

    return {
      ...item,
      props: processedProps as ComponentData['props'],
    };
  };

  // Extend component props with defaults (recursively)
  if (isContentArray(extendedData.content)) {
    extendedData.content = extendedData.content.map(extendComponentItem);
  } else {
    extendedData.content = [];
  }

  // now process extendedData.root.content (recursively)
  if (isContentArray(extendedData.root.content)) {
    extendedData.root.content = extendedData.root.content.map(extendComponentItem);
  } else {
    extendedData.root.content = [];
  }

  // process components that may be placed under root.props.content (recursively)
  if (isContentArray(extendedData.root.props.content)) {
    extendedData.root.props.content = extendedData.root.props.content.map(extendComponentItem);
  }

  // also process zones (recursively)
  if (extendedData.zones) {
    for (const [zoneName, zoneContent] of Object.entries(extendedData.zones)) {
      if (isContentArray(zoneContent)) {
        extendedData.zones[zoneName] = zoneContent.map(extendComponentItem);
      }
    }
  }

  return extendedData;
}
