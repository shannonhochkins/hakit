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
      if (!isComponent(item)) continue;
      const componentConfig = userConfig.components?.[item.type as keyof typeof userConfig.components];
      if (!componentConfig?.fields) continue; // Exclude components with no config

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
      if (fieldKey === '_activeBreakpoint') continue; // Skip _activeBreakpoint so we don't store in db
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
      result.styles = (obj as Record<string, unknown>).styles;
    }

    return result;
  };

  // Process content array (components)
  if (data.content) {
    trimmedData.content = trimContentArray(data.content);
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

  // Deep clone to avoid mutations
  const extendedData: PuckPageData = {
    root: data.root ? { ...data.root, props: { ...data.root.props } } : { props: {} },
    content: data.content ? [...data.content] : [],
    zones: { ...data.zones },
  };

  // Extend root props with defaults
  if (defaultProps && extendedData.root.props) {
    // Extend each remote's props with their defaults
    for (const [remoteId, remoteDefaults] of Object.entries(defaultProps as Record<string, unknown>)) {
      // only merge top level objects
      if (remoteId in extendedData.root.props && typeof (extendedData.root.props as Record<string, unknown>)[remoteId] === 'object') {
        // Remote exists, deep merge defaults (base) with existing data (overlay)
        (extendedData.root.props as Record<string, unknown>)[remoteId] = merge(
          remoteDefaults as Record<string, unknown>,
          (extendedData.root.props as Record<string, unknown>)[remoteId] as Record<string, unknown>
        );
      } else {
        // Remote doesn't exist, use defaults as-is
        (extendedData.root.props as Record<string, unknown>)[remoteId] = remoteDefaults as Record<string, unknown>;
      }
    }
  }

  // Extend component props with defaults
  if (extendedData.content) {
    extendedData.content = extendedData.content.map(item => {
      const componentConfig = userConfig.components?.[item.type];
      if (!componentConfig?.defaultProps) return item;

      // Deep merge defaults (base) with existing component props (overlay)
      const extendedProps = merge(componentConfig.defaultProps, item.props || {});

      return {
        ...item,
        props: extendedProps,
      };
    });
  }

  return extendedData;
}
