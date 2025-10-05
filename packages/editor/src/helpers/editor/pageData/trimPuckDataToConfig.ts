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
export function trimPuckDataToConfig<T extends CustomPuckConfig = CustomPuckConfig>(
  data: PuckPageData | null,
  userConfig?: T
): PuckPageData | null {
  if (!data || !userConfig) return data;

  // Deep clone to avoid mutations
  const trimmedData: PuckPageData = {
    root: data.root ? { ...data.root } : { props: {} },
    content: [],
    zones: { ...data.zones },
  };

  // Helper function to trim object fields recursively
  const trimObjectFields = (
    obj: Record<string, unknown>,
    objectFields: Record<string, FieldConfiguration[string]>
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    Object.keys(objectFields).forEach(fieldKey => {
      const fieldConfig = objectFields[fieldKey];
      const value = obj[fieldKey];
      if (value === undefined) return;
      if (fieldKey === '_activeBreakpoint') return; // Skip _activeBreakpoint so we don't store in db
      // Check if this is an object field that has nested objectFields
      if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
        const nestedObjectFields = fieldConfig.objectFields;
        // Recursively trim nested object fields
        if (typeof value === 'object' && value !== null) {
          result[fieldKey] = trimObjectFields(value as Record<string, unknown>, nestedObjectFields);
        }
      } else if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
        const arrayFields = fieldConfig.arrayFields;
        // Recursively trim array fields
        if (Array.isArray(value)) {
          result[fieldKey] = value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return trimObjectFields(item as Record<string, unknown>, arrayFields);
            }
            return item;
          });
        }
      } else {
        // Keep the field as-is for any other field type
        result[fieldKey] = value;
      }
    });

    return result;
  };

  // Process content array (components)
  if (data.content) {
    trimmedData.content = data.content
      .map((item: ComponentData) => {
        const componentConfig = userConfig.components?.[item.type];
        if (!componentConfig?.fields) {
          // If no config found for this component type, exclude it entirely
          return null;
        }

        // Trim props to only include fields defined in the component config
        const trimmedProps: Record<string, unknown> = {};

        // Always preserve the top-level id field if it exists (system field for components)
        if (item.props?.id !== undefined) {
          trimmedProps.id = item.props.id;
        }

        Object.keys(componentConfig.fields).forEach(fieldKey => {
          const fieldConfig = componentConfig.fields![fieldKey];
          const value = item.props?.[fieldKey];

          if (value === undefined) return;
          if (fieldKey === '_activeBreakpoint') return; // Skip _activeBreakpoint so we don't store in db
          // Note: We don't skip 'id' here because it might be a valid nested field in objectFields/arrayFields
          // Check if this is an object field that has nested objectFields
          if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
            // Recursively trim object fields
            if (typeof value === 'object' && value !== null) {
              trimmedProps[fieldKey] = trimObjectFields(value, fieldConfig.objectFields);
            }
          } else if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
            const arrayFields = fieldConfig.arrayFields;
            // Recursively trim array fields
            if (Array.isArray(value)) {
              trimmedProps[fieldKey] = value.map(item => {
                if (typeof item === 'object' && item !== null) {
                  return trimObjectFields(item as Record<string, unknown>, arrayFields);
                }
                return item;
              });
            }
          } else {
            // Keep the field as-is for any other field type
            trimmedProps[fieldKey] = value;
          }
        });

        return {
          ...item,
          props: trimmedProps,
        };
      })
      .filter((item): item is ComponentData => item !== null);
  }

  // Process root fields
  if (data.root?.props) {
    if (userConfig.root?.fields) {
      // If root fields are configured, trim to only include configured fields
      const trimmedRootProps: Record<string, unknown> = {};

      Object.keys(userConfig.root.fields).forEach(fieldKey => {
        const fieldConfig = userConfig.root!.fields![fieldKey];
        const value = data.root!.props![fieldKey];
        if (fieldKey === '_activeBreakpoint') return; // Skip _activeBreakpoint so we don't store in db
        if (value === undefined) return;
        if (fieldConfig.type === 'slot') return; // Skip slot types
        // Check if this is an object field that has nested objectFields
        if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
          const objectFields = fieldConfig.objectFields;
          // Recursively trim object fields
          if (typeof value === 'object' && value !== null) {
            trimmedRootProps[fieldKey] = trimObjectFields(value as Record<string, unknown>, objectFields);
          }
        } else if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
          const arrayFields = fieldConfig.arrayFields;
          // Recursively trim array fields
          if (Array.isArray(value)) {
            trimmedRootProps[fieldKey] = value.map(item => {
              if (typeof item === 'object' && item !== null) {
                return trimObjectFields(item as Record<string, unknown>, arrayFields);
              }
              return item;
            });
          }
        } else {
          // Keep the field as-is for any other field type
          trimmedRootProps[fieldKey] = value;
        }
      });

      trimmedData.root.props = trimmedRootProps;
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
export function extendPuckDataWithDefaults(data: PuckPageData, userConfig: CustomPuckConfig<DefaultComponentProps>): PuckPageData {
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
    for (const [remoteId, remoteDefaults] of Object.entries(defaultProps)) {
      // only merge top level objects
      if (remoteId in extendedData.root.props && typeof extendedData.root.props[remoteId] === 'object') {
        // Remote exists, deep merge defaults (base) with existing data (overlay)
        extendedData.root.props[remoteId] = merge(remoteDefaults, extendedData.root.props[remoteId]);
      } else {
        // Remote doesn't exist, use defaults as-is
        extendedData.root.props[remoteId] = remoteDefaults;
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
