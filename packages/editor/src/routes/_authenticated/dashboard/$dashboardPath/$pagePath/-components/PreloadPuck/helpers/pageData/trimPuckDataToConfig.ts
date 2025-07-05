import { PuckPageData } from '@typings/puck';
import { ComponentData } from '@measured/puck';

/**
 * Simplified field config for trimming function - compatible with any field config structure
 */
type TrimFieldConfig = {
  type?: string;
  objectFields?: Record<string, TrimFieldConfig>;
  [key: string]: unknown;
};

/**
 * Flexible user config type for trimming function - works with UserConfig
 */
type TrimUserConfig = {
  components?: Record<
    string,
    {
      fields?: Record<string, TrimFieldConfig>;
      [key: string]: unknown;
    }
  >;
  root?: {
    fields?: Record<string, TrimFieldConfig>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * Trims PuckPageData to only include fields that are defined in the userConfig.
 * This ensures that any data not present in the configuration is removed,
 * preventing invalid or orphaned data from persisting.
 *
 * @param data - The PuckPageData to trim
 * @param userConfig - The user configuration that defines valid fields
 * @returns Trimmed PuckPageData containing only valid fields, or null if input data is null
 *
 * @example
 * ```ts
 * const trimmedData = trimPuckDataToConfig(puckData, userConfig);
 * // Only fields defined in userConfig.components and userConfig.root.fields will remain
 * ```
 * // TODO - figure out how to trim zones that have information that no longer are valid
 */
export function trimPuckDataToConfig(data: PuckPageData | null, userConfig?: TrimUserConfig): PuckPageData | null {
  if (!data || !userConfig) return data;

  // Deep clone to avoid mutations
  const trimmedData: PuckPageData = {
    root: data.root ? { ...data.root } : { props: {} },
    content: [],
    zones: { ...data.zones },
  };

  // Helper function to trim object fields recursively
  const trimObjectFields = (obj: Record<string, unknown>, objectFields: Record<string, TrimFieldConfig>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    Object.keys(objectFields).forEach(fieldKey => {
      const fieldConfig = objectFields[fieldKey];
      const value = obj[fieldKey];

      if (value === undefined) return;

      // Check if this is an object field that has nested objectFields
      if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
        // Recursively trim nested object fields
        if (typeof value === 'object' && value !== null) {
          result[fieldKey] = trimObjectFields(
            value as Record<string, unknown>,
            fieldConfig.objectFields as Record<string, TrimFieldConfig>
          );
        }
      } else {
        // Keep the field as-is (including arrays and other types)
        // This works for any field type that doesn't have nested object fields
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

        Object.keys(componentConfig.fields).forEach(fieldKey => {
          const fieldConfig = componentConfig.fields![fieldKey];
          const value = item.props?.[fieldKey];

          if (value === undefined) return;

          // Check if this is an object field that has nested objectFields
          if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
            // Recursively trim object fields
            if (typeof value === 'object' && value !== null) {
              trimmedProps[fieldKey] = trimObjectFields(
                value as Record<string, unknown>,
                fieldConfig.objectFields as Record<string, TrimFieldConfig>
              );
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

        if (value === undefined) return;

        // Check if this is an object field that has nested objectFields
        if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
          // Recursively trim object fields
          if (typeof value === 'object' && value !== null) {
            trimmedRootProps[fieldKey] = trimObjectFields(
              value as Record<string, unknown>,
              fieldConfig.objectFields as Record<string, TrimFieldConfig>
            );
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
