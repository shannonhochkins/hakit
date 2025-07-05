import { BreakPoint } from '@hakit/components';
import { ComponentBreakpointModeMap } from '@lib/hooks/useGlobalStore';
import { CustomConfig, PuckPageData } from '@typings/puck';
import { merge } from 'ts-deepmerge';
import { ComponentData } from '@measured/puck';
import type { CustomFieldsConfiguration } from '@typings/fields';

/**
 * Converts Puck's flattened data structure back to database format with breakpoint objects merged with the original data
 *
 * This function is the reverse of `dbValueToPuck` and handles complex logic based on field
 * configuration to determine how values should be stored in the database:
 *
 * **Breakpoint Storage Logic:**
 * - If `disableBreakpoints: true` OR field type is ['object', 'array', 'divider'] → store under `$xlg` only
 * - If `disableBreakpoints: false` AND field has "breakpoints" enabled → update current breakpoint key
 * - If field has "breakpoints" enabled → also always set `$xlg` as fallback
 *
 * **Field Configuration Detection:**
 * The function automatically detects field configuration patterns and applies the appropriate
 * breakpoint storage strategy. It handles deeply nested structures and maintains type safety.
 *
 * The userConfig should be the driver for the entire output, for example if the originalData or the changedData contains fields that
 * are not present in the userConfig, they will be ignored.
 *
 * If the field is present in the user config but not in the originalData, it will be added with the $xlg breakpoint value and should only do this if there
 * is a default value set in the userConfig for the particular field.
 *
 * It will traverse all fields recursively, objectFields and arrayFields etc
 *
 * Considerations:
 *   - Not changing the original data structure for unrelated breakpoints and potentially resetting something incorrectly
 *   - Ensure we understand how dbValueToPuck works under the hood, it will grab the closest matching value based on the input breakpoint variable
 *
 * @param originalData - The original Puck data structure with breakpoint values stored in the database
 * @param puckData - The complete Puck data structure with flattened values for the current breakpoint
 * @param currentBreakpoint - The currently active breakpoint that the flattened values represent
 * @param userConfig - Complete user configuration with components and root field definitions
 * @param breakpointModeMap - Map of component instances to their field breakpoint states
 * @returns The transformed data structure with values converted to breakpoint object format merged with the original data
 * ```
 *
 * @example breakpointModeMap
 * ```ts
 * {
 *   'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00': {
 *     options.deep.deepText: true,
 *     options.text: false,
 *   }
 * }
 */
export function puckToDBValue(
  originalData: PuckPageData | null, // this contains breakpoint values stored in the db
  changedData: PuckPageData | null, // this does not contain breakpoint values, just the current data from puck
  currentBreakpoint: BreakPoint, // the current breakpoint that the puck data is for
  userConfig?: CustomConfig, // this is the user config that contains field definitions and component definitions for puck
  breakpointModeMap: ComponentBreakpointModeMap = {} // this is the map of component instances to their field breakpoint states
): PuckPageData | null {
  if (!changedData || !userConfig) return originalData;

  // Deep clone the changed data to avoid mutations
  const newDataWithBp: PuckPageData = JSON.parse(JSON.stringify(changedData));

  // Helper function to check if field type should disable breakpoints
  const shouldDisableBreakpoints = (fieldConfig: CustomFieldsConfiguration[string]): boolean => {
    // Check if disableBreakpoints is explicitly set on the field
    if ('disableBreakpoints' in fieldConfig && fieldConfig.disableBreakpoints === true) return true;
    const type = fieldConfig?.type;
    return ['object', 'array', 'divider'].includes(type);
  };

  // Helper function to process a field value based on its configuration
  const processFieldValue = (
    fieldPath: string,
    fieldConfig: CustomFieldsConfiguration[string],
    currentValue: unknown,
    originalValue: unknown,
    componentId?: string
  ): unknown => {
    if (!fieldConfig) return currentValue;

    const isBreakpointEnabled = componentId && breakpointModeMap[componentId]?.[fieldPath];
    const disableBreakpoints = shouldDisableBreakpoints(fieldConfig);

    // If breakpoints are disabled OR field doesn't have breakpoints enabled, store under $xlg only
    if (disableBreakpoints || !isBreakpointEnabled) {
      return {
        [`$xlg`]: currentValue,
      };
    }

    // If breakpoints are enabled, update current breakpoint and ensure $xlg fallback
    const result =
      originalValue && typeof originalValue === 'object' && originalValue.constructor === Object
        ? { ...originalValue }
        : ({} as Record<string, unknown>);

    // Set the current breakpoint value
    result[`$${currentBreakpoint}`] = currentValue;

    // Always ensure $xlg exists - if it doesn't exist, use the current value
    if (!result.$xlg) {
      result.$xlg = currentValue;
    }

    return result;
  };

  // Helper function to traverse object fields recursively
  const traverseObjectFields = (
    objectFields: Record<string, CustomFieldsConfiguration[string]>,
    currentObj: Record<string, unknown>,
    originalObj: Record<string, unknown> | undefined,
    basePath: string,
    componentId?: string
  ): Record<string, unknown> => {
    if (!objectFields || !currentObj) return currentObj;

    const result: Record<string, unknown> = {};

    Object.keys(objectFields).forEach(fieldKey => {
      const fieldConfig = objectFields[fieldKey];
      const fieldPath = basePath ? `${basePath}.${fieldKey}` : fieldKey;
      const currentValue = currentObj[fieldKey];
      const originalValue = originalObj?.[fieldKey];

      if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
        // Recursively process nested object fields
        result[fieldKey] = traverseObjectFields(
          fieldConfig.objectFields,
          (currentValue as Record<string, unknown>) || {},
          originalValue as Record<string, unknown> | undefined,
          fieldPath,
          componentId
        );
      } else if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
        // For arrays, completely replace with current value wrapped in $xlg
        // Arrays don't support breakpoints at the individual item level
        result[fieldKey] = {
          [`$xlg`]: currentValue,
        };
      } else {
        // Process regular field with breakpoint logic
        result[fieldKey] = processFieldValue(fieldPath, fieldConfig, currentValue, originalValue, componentId);
      }
    });

    return result;
  };

  // Process content array (components)
  if (newDataWithBp.content) {
    newDataWithBp.content = newDataWithBp.content.map((item: ComponentData) => {
      const componentConfig = userConfig.components?.[item.type];
      const componentFields = componentConfig?.fields;
      if (!componentFields) return item;

      const componentId = item.props?.id;
      const originalItem = originalData?.content?.find((orig: ComponentData) => orig.props?.id === componentId);

      // Start with the current props, then process each configured field
      const newProps: Record<string, unknown> = { ...item.props };

      // Process each field in the component based on userConfig
      Object.keys(componentFields).forEach(fieldKey => {
        const fieldConfig = componentFields[fieldKey];
        const currentValue = item.props[fieldKey];
        const originalValue = originalItem?.props?.[fieldKey];

        if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
          newProps[fieldKey] = traverseObjectFields(
            fieldConfig.objectFields as Record<string, CustomFieldsConfiguration[string]>,
            currentValue as Record<string, unknown>,
            originalValue as Record<string, unknown> | undefined,
            fieldKey,
            componentId
          );
        } else if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
          // Arrays are completely replaced and stored under $xlg
          newProps[fieldKey] = {
            [`$xlg`]: currentValue,
          };
        } else {
          newProps[fieldKey] = processFieldValue(
            fieldKey,
            fieldConfig as CustomFieldsConfiguration[string],
            currentValue,
            originalValue,
            componentId
          );
        }
      });

      // Find the original component to preserve any custom properties
      const originalComponent = originalData?.content?.find((orig: ComponentData) => orig.props?.id === componentId);

      return {
        ...originalComponent, // Preserve custom properties from original
        ...item, // Override with current component data
        props: newProps, // Use the processed props
      };
    });
  }

  // Process root fields
  if (userConfig.root?.fields && newDataWithBp.root?.props) {
    const originalRootProps = originalData?.root?.props || {};
    const newRootProps: Record<string, unknown> = {};

    // Process each field in the root based on userConfig - only process valid fields
    Object.keys(userConfig.root.fields).forEach(fieldKey => {
      const fieldConfig = userConfig.root?.fields![fieldKey];
      const currentValue = newDataWithBp.root!.props![fieldKey];
      const originalValue = originalRootProps[fieldKey];

      if (!fieldConfig) return; // Skip if no field config found

      if (fieldConfig.type === 'object' && fieldConfig.objectFields) {
        newRootProps[fieldKey] = traverseObjectFields(
          fieldConfig.objectFields as Record<string, CustomFieldsConfiguration[string]>,
          currentValue as Record<string, unknown>,
          originalValue as Record<string, unknown> | undefined,
          fieldKey,
          'root' // Use 'root' as componentId for root fields
        );
      } else if (fieldConfig.type === 'array' && fieldConfig.arrayFields) {
        // Arrays are completely replaced and stored under $xlg
        newRootProps[fieldKey] = {
          [`$xlg`]: currentValue,
        };
      } else {
        newRootProps[fieldKey] = processFieldValue(
          fieldKey,
          fieldConfig as CustomFieldsConfiguration[string],
          currentValue,
          originalValue,
          'root' // Use 'root' as componentId for root fields
        );
      }
    });

    // Update the root props with processed values (only valid fields)
    newDataWithBp.root.props = newRootProps;
  }

  // Deep merge the original data with the transformed data
  // The new data should take precedence over the original data
  // mergeArrays: false ensures arrays are completely replaced rather than merged
  const result = merge.withOptions(
    {
      mergeArrays: false,
    },
    originalData || {},
    newDataWithBp || {}
  );

  // If we processed root fields, ensure we completely override root props to remove invalid fields
  if (userConfig.root?.fields && newDataWithBp.root?.props) {
    if (result.root) {
      result.root.props = newDataWithBp.root.props;
    }
  }

  return result;
}
