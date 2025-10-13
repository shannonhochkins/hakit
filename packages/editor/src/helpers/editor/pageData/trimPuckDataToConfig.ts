import { CustomPuckConfig, PuckPageData } from '@typings/puck';
import { ComponentData, DefaultComponentProps } from '@measured/puck';
import { FieldConfiguration } from '@typings/fields';
import { merge } from 'ts-deepmerge';

/**
 * Trims PuckPageData to only include fields that are defined in the userConfig.
 * This ensures that any data not present in the configuration is removed,
 * preventing invalid or orphaned data from persisting.
 *
 * **Important Design Decisions:**
 * - Recursively trims object fields with `objectFields` configuration
 * - Recursively trims array fields with `arrayFields` configuration
 * - Array items that are objects will have their keys trimmed to match the arrayFields config
 * - Always preserves the top-level `id` field for content items (system field)
 * - Nested `id` fields are processed normally and trimmed if not in config
 * - This ensures data integrity by removing any invalid or orphaned fields
 *
 * @param data - The PuckPageData to trim
 * @param userConfig - The user configuration that defines valid fields
 * @returns Trimmed PuckPageData containing only valid fields, or null if input data is null
 *
 * @example
 * ```ts
 * const trimmedData = trimPuckDataToConfig(puckData, userConfig);
 * // Only fields defined in userConfig.components and userConfig.root.fields will remain
 * // The top-level id field will always be preserved for content items
 * ```
 * // TODO - figure out how to trim zones that have information that no longer are valid
 */
export function trimPuckDataToConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
>(data: PuckPageData | null, userConfig?: CustomPuckConfig<Props, RootProps>): PuckPageData | null {
  if (!data || !userConfig) return data;

  // Deep clone to avoid mutations
  const trimmedData: PuckPageData = {
    root: data.root ? { ...data.root } : { props: {} },
    content: [],
    zones: { ...data.zones },
  };

  // Helper: test if a value looks like a component item
  const isComponent = (val: unknown): val is ComponentData => {
    return !!val && typeof val === 'object' && 'type' in (val as Record<string, unknown>) && 'props' in (val as Record<string, unknown>);
  };

  // Helper: trim a content array (slot) according to userConfig.components
  const trimContentArray = (arr: unknown): ComponentData[] => {
    if (!Array.isArray(arr)) return [];
    const out: ComponentData[] = [];
    for (const item of arr) {
      if (!isComponent(item)) {
        continue;
      }
      const componentConfig = userConfig.components?.[item.type as keyof typeof userConfig.components];
      if (!componentConfig?.fields) {
        continue;
      } // Exclude components with no config

      const trimmedProps: Record<string, unknown> = {};
      // Preserve top-level id
      if (item.props?.id !== undefined) trimmedProps.id = item.props.id;

      // Trim props by component field config
      const byConfig = trimPropsByFields(item.props || {}, componentConfig.fields as unknown as Record<string, FieldConfiguration[string]>);
      Object.assign(trimmedProps, byConfig);

      // Retain styles even if not in config
      if (item.props && 'styles' in item.props && trimmedProps.styles === undefined) {
        trimmedProps.styles = (item.props as Record<string, unknown>).styles;
      }

      out.push({ ...item, props: trimmedProps } as ComponentData);
    }
    return out;
  };

  // Helper: trim an object of props based on a fields map (recursive)
  type AnyFieldConfig = FieldConfiguration[string];
  const trimPropsByFields = <F extends Record<string, AnyFieldConfig>>(
    obj: Record<string, unknown>,
    fields: F
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const fieldKey in fields) {
      const fieldConfig = fields[fieldKey as keyof F] as AnyFieldConfig;
      const value = obj[fieldKey];
      if (value === undefined) continue;

      switch (fieldConfig.type) {
        case 'object': {
          if (fieldConfig.objectFields && typeof value === 'object' && value !== null) {
            result[fieldKey] = trimPropsByFields(value as Record<string, unknown>, fieldConfig.objectFields);
          }
          break;
        }
        case 'array': {
          if (fieldConfig.arrayFields && Array.isArray(value)) {
            result[fieldKey] = value.map(item =>
              typeof item === 'object' && item !== null ? trimPropsByFields(item as Record<string, unknown>, fieldConfig.arrayFields) : item
            );
          }
          break;
        }
        case 'slot': {
          // Slots are arrays of components; trim using component configs
          result[fieldKey] = trimContentArray(value);
          break;
        }
        default: {
          // Keep primitive or non-nested fields as-is
          result[fieldKey] = value;
        }
      }
    }

    // Always retain styles if present on source, even if not defined in config
    if ('styles' in obj && result.styles === undefined) {
      result.styles = obj.styles;
    }

    // Check for any content arrays that might contain components (not just slot fields)
    if ('content' in obj && Array.isArray(obj.content) && !('content' in result)) {
      // This is a content array that wasn't processed by field config, trim it as components
      result.content = trimContentArray(obj.content);
    }

    return result;
  };

  // Process content array (components)
  if (data.content) {
    trimmedData.content = trimContentArray(data.content);
  }
  // now process root content array (components)
  if (data.root?.content) {
    trimmedData.root.content = trimContentArray(data.root.content);
  }

  // Process root fields
  if (data.root?.props) {
    if (userConfig.root?.fields) {
      // If root fields are configured, trim to only include configured fields
      const trimmedRootProps = trimPropsByFields(
        data.root.props,
        userConfig.root.fields as unknown as Record<string, FieldConfiguration[string]>
      );
      trimmedData.root.props = trimmedRootProps;
      // Ensure styles at root-level are retained even if not present in config
      if (data.root.props && 'styles' in data.root.props && trimmedData.root.props.styles === undefined) {
        trimmedData.root.props.styles = data.root.props.styles;
      }
    } else {
      // If no root fields are configured, empty the root props
      trimmedData.root.props = {};
    }
  }

  return trimmedData;
}

// TODO - See if we can replace this with walkTree from puck

/**
 * Extends PuckPageData with missing default properties from userConfig.defaultProps.
 * This should be called AFTER dbValueToPuck since that removes breakpoint keys.
 * Uses deepmerge to merge defaults (base) with existing data (overlay).
 *
 * @param data - The PuckPageData to extend (after dbValueToPuck processing)
 * @param userConfig - The user configuration containing defaultProps
 * @returns Extended PuckPageData with missing default properties added
 */
export function extendPuckDataWithDefaults<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
>(data: PuckPageData, userConfig: CustomPuckConfig<Props, RootProps>): PuckPageData {
  const defaultProps = userConfig.root?.defaultProps;
  if (!defaultProps) return data;

  // Deep clone to avoid mutations - create a completely new structure
  // Clone zones with new arrays to avoid shared references
  const clonedZones: Record<string, ComponentData[]> = {};
  if (data.zones) {
    for (const [zoneName, zoneContent] of Object.entries(data.zones)) {
      clonedZones[zoneName] = Array.isArray(zoneContent) ? [...zoneContent] : [];
    }
  }

  const extendedData: PuckPageData = {
    root: data.root
      ? {
          ...data.root,
          props: {}, // Start with empty props, will populate below
          content: data.root.content ? [...data.root.content] : undefined,
        }
      : { props: {} },
    content: data.content ? [...data.content] : [],
    zones: clonedZones,
  };

  // Extend root props with defaults
  if (defaultProps && data.root?.props) {
    // Build new root props from scratch to avoid any shared references
    const newRootProps: Record<string, unknown> = {};

    // First, deep clone all existing props that aren't in defaults
    for (const [key, value] of Object.entries(data.root.props)) {
      if (!(key in defaultProps)) {
        // Property not in defaults, deep clone it to avoid mutation
        newRootProps[key] = typeof value === 'object' && value !== null ? JSON.parse(JSON.stringify(value)) : value;
      }
    }

    // Then merge defaults with existing values
    for (const [remoteId, remoteDefaults] of Object.entries(defaultProps as Record<string, unknown>)) {
      if (remoteId in data.root.props && typeof (data.root.props as Record<string, unknown>)[remoteId] === 'object') {
        // Remote exists, deep merge defaults (base) with existing data (overlay)
        // merge creates a new object, so this is safe
        newRootProps[remoteId] = merge(
          remoteDefaults as Record<string, unknown>,
          (data.root.props as Record<string, unknown>)[remoteId] as Record<string, unknown>
        );
      } else {
        // Remote doesn't exist, use defaults as-is
        newRootProps[remoteId] = remoteDefaults as Record<string, unknown>;
      }
    }

    extendedData.root.props = newRootProps;
  } else if (data.root?.props) {
    // No defaults, but we still need to deep clone to avoid mutations
    extendedData.root.props = JSON.parse(JSON.stringify(data.root.props)) as typeof data.root.props;
  }

  // Helper function to recursively extend a component item with default props
  const extendComponentItem = (item: ComponentData): ComponentData => {
    const componentConfig = userConfig.components?.[item.type];

    if (!componentConfig?.defaultProps) {
      // No defaults, but we still need to clone to avoid mutations
      // Deep clone the props to ensure no shared references
      return {
        ...item,
        props: (item.props ? JSON.parse(JSON.stringify(item.props)) : {}) as ComponentData['props'],
      };
    }

    // Deep merge defaults (base) with existing component props (overlay)
    // merge() creates a new object, so this is safe
    const extendedProps = merge(componentConfig.defaultProps, item.props || {}) as ComponentData['props'];

    // Recursively process any nested content arrays
    const processedProps = { ...extendedProps } as Record<string, unknown>;

    // Check if this component has a content array (slot field)
    if (Array.isArray(processedProps.content)) {
      processedProps.content = (processedProps.content as ComponentData[]).map(extendComponentItem);
    }

    // Check for any other props that might contain component arrays
    for (const [key, value] of Object.entries(processedProps)) {
      if (key !== 'content' && Array.isArray(value) && value.length > 0) {
        // Check if this looks like a component array
        const firstItem = value[0];
        if (firstItem && typeof firstItem === 'object' && 'type' in firstItem && 'props' in firstItem) {
          (processedProps as Record<string, unknown>)[key] = (value as ComponentData[]).map(extendComponentItem);
        }
      }
    }

    return {
      ...item,
      props: processedProps as ComponentData['props'],
    };
  };

  // Extend component props with defaults (recursively)
  if (extendedData.content) {
    extendedData.content = extendedData.content.map(extendComponentItem);
  } else {
    extendedData.content = [];
  }

  // now process extendedData.root.content (recursively)
  if (extendedData.root.content) {
    extendedData.root.content = extendedData.root.content.map(extendComponentItem);
  } else {
    extendedData.root.content = [];
  }

  // also process zones (recursively)
  if (extendedData.zones) {
    for (const [zoneName, zoneContent] of Object.entries(extendedData.zones)) {
      if (Array.isArray(zoneContent)) {
        extendedData.zones[zoneName] = zoneContent.map(extendComponentItem);
      }
    }
  }

  return extendedData;
}
