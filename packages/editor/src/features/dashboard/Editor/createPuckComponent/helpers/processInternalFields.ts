import { DefaultComponentProps } from '@measured/puck';
import type { FieldConfiguration, FieldFor, InternalComponentFields, InternalRootComponentFields } from '@typings/fields';
import type { InternalFieldsConfig } from '@typings/puck';
import type { DeepPartial } from '@typings/utils';

/**
 * Extracts the DataShape from a FieldConfiguration type
 */
type ExtractDataShape<F> =
  F extends Record<string, FieldFor<unknown, infer DataShape>>
    ? DataShape
    : F extends FieldConfiguration<infer FullDataShape extends DefaultComponentProps>
      ? FullDataShape
      : never;

/**
 * Creates field configuration for extended fields using the same DataShape
 */
type ExtendedFieldsConfig<ExtendedInternalFields extends object, DataShape> = {
  [K in keyof ExtendedInternalFields]: FieldFor<ExtendedInternalFields[K], DataShape>;
};

/**
 * Deep merges FieldConfiguration<P> with extended fields
 * This ensures extended fields are properly typed and merged into the result
 */
type MergedFieldConfiguration<P extends object, ExtendedInternalFields extends object | undefined> = ExtendedInternalFields extends object
  ? FieldConfiguration<P & DeepPartial<ExtendedInternalFields>> &
      ExtendedFieldsConfig<ExtendedInternalFields, ExtractDataShape<FieldConfiguration<P & DeepPartial<ExtendedInternalFields>>>>
  : FieldConfiguration<P>;

/**
 * Recursively removes fields from a field configuration based on omit paths
 */
function applyOmitToFields<F>(fields: F, omitConfig: Record<string, unknown> | false | undefined): F {
  if (omitConfig === false || !omitConfig) {
    return fields;
  }

  const result = { ...(fields as Record<string, unknown>) } as F;
  for (const [key, value] of Object.entries(omitConfig)) {
    if (value === true) {
      // Remove this field completely
      delete (result as Record<string, unknown>)[key];
    } else if (value && typeof value === 'object' && key in (result as Record<string, unknown>)) {
      // Recursively process nested fields
      const fieldValue = (result as Record<string, unknown>)[key];
      if (fieldValue && typeof fieldValue === 'object' && 'objectFields' in fieldValue) {
        const fieldConfig = { ...(fieldValue as Record<string, unknown>) } as { objectFields?: Record<string, unknown> };
        if (fieldConfig.objectFields) {
          fieldConfig.objectFields = applyOmitToFields({ ...fieldConfig.objectFields }, value as Record<string, unknown>);
        }
        (result as Record<string, unknown>)[key] = fieldConfig;
      }
    }
  }
  return result;
}

/**
 * Converts extend config structure to proper field configuration format
 * Extend config: { key: { nestedKey: { type: 'color', ... } } }
 * Field config: { key: { type: 'object', objectFields: { nestedKey: { type: 'color', ... } } } }
 */
function convertExtendToFieldConfig(extendValue: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(extendValue)) {
    if (value && typeof value === 'object' && !('type' in value)) {
      // This is a nested object that needs to be converted to object field format
      const nestedFields = convertExtendToFieldConfig(value as Record<string, unknown>);
      result[key] = {
        type: 'object',
        objectFields: nestedFields,
      };
    } else {
      // This is already a field definition (has 'type' property)
      result[key] = value;
    }
  }

  return result;
}

/**
 * Recursively merges extended fields into a field configuration
 */
function applyExtendToFields<F>(fields: F, extendConfig: Record<string, unknown> | undefined): F {
  if (!extendConfig) {
    return fields;
  }

  const result = { ...(fields as Record<string, unknown>) } as F;
  const newFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(extendConfig)) {
    if (value && typeof value === 'object') {
      if (key in (result as Record<string, unknown>)) {
        // Field exists, merge recursively
        const fieldValue = (result as Record<string, unknown>)[key];
        if (fieldValue && typeof fieldValue === 'object' && 'objectFields' in fieldValue) {
          const fieldConfig = fieldValue as { objectFields?: Record<string, unknown> };
          if (fieldConfig.objectFields) {
            // Convert the extend config value to proper field configuration format
            const convertedExtendValue = convertExtendToFieldConfig(value as Record<string, unknown>);
            // Recursively merge nested objectFields - if a key exists in both and both have objectFields, merge them
            // Preserve existing field metadata (label, description, section, etc.) when merging
            const mergedObjectFields: Record<string, unknown> = {};

            // First, add all extended fields (they should appear first)
            for (const [extendKey, extendField] of Object.entries(convertedExtendValue)) {
              if (extendKey in fieldConfig.objectFields) {
                // Key exists in both - check if both have objectFields to merge recursively
                const existingField = fieldConfig.objectFields[extendKey];
                const extendFieldObj = extendField as Record<string, unknown>;

                if (
                  existingField &&
                  typeof existingField === 'object' &&
                  'objectFields' in existingField &&
                  extendFieldObj &&
                  typeof extendFieldObj === 'object' &&
                  'objectFields' in extendFieldObj
                ) {
                  // Both have objectFields - merge them recursively, preserving existing field metadata
                  const existingFieldObj = existingField as Record<string, unknown>;
                  const existingObjFields = (existingFieldObj.objectFields as Record<string, unknown>) || {};
                  const extendObjFields = (extendFieldObj.objectFields as Record<string, unknown>) || {};

                  // Preserve all existing field properties (label, description, section, etc.)
                  // and only merge the objectFields
                  mergedObjectFields[extendKey] = {
                    ...existingFieldObj, // Preserve existing metadata
                    objectFields: {
                      ...extendObjFields, // Extended fields first
                      ...existingObjFields, // Then existing fields
                    },
                  };
                } else {
                  // One or both don't have objectFields - extended field takes precedence
                  mergedObjectFields[extendKey] = extendField;
                }
              } else {
                // New field from extend config
                mergedObjectFields[extendKey] = extendField;
              }
            }

            // Then add all existing fields that weren't in the extend config
            for (const [existingKey, existingField] of Object.entries(fieldConfig.objectFields)) {
              if (!(existingKey in mergedObjectFields)) {
                mergedObjectFields[existingKey] = existingField;
              }
            }

            fieldConfig.objectFields = mergedObjectFields;
          } else {
            // No existing objectFields, convert and set the extend value directly
            fieldConfig.objectFields = convertExtendToFieldConfig(value as Record<string, unknown>);
          }
        }
      } else {
        // New field - if it already has a 'type' property, add it directly
        // Otherwise, convert to proper format and wrap in object field
        if (value && typeof value === 'object' && 'type' in value) {
          // Already a field definition - store it to add at the start later
          newFields[key] = value;
          // Remove from result if it exists (shouldn't, but just in case)
          delete (result as Record<string, unknown>)[key];
        } else {
          // Nested object without type - convert and wrap
          const convertedValue = convertExtendToFieldConfig(value as Record<string, unknown>);
          newFields[key] = {
            type: 'object',
            objectFields: convertedValue,
          };
          // Remove from result if it exists
          delete (result as Record<string, unknown>)[key];
        }
      }
    }
  }

  // Reorder: new fields first (in reverse order so last added appears first), then existing fields
  if (Object.keys(newFields).length > 0) {
    const reorderedResult: Record<string, unknown> = {};
    // Add new fields in reverse order (last added first)
    const newFieldKeys = Object.keys(newFields).reverse();
    for (const key of newFieldKeys) {
      reorderedResult[key] = newFields[key];
    }
    // Then add all existing fields
    for (const [key, value] of Object.entries(result as Record<string, unknown>)) {
      if (!(key in reorderedResult)) {
        reorderedResult[key] = value;
      }
    }
    return reorderedResult as F;
  }

  return result;
}

/**
 * Recursively applies default value overrides to field configurations
 */
function applyDefaultsToFields<F>(fields: F, defaultsConfig: Record<string, unknown> | undefined): F {
  if (!defaultsConfig) {
    return fields;
  }

  const result = { ...(fields as Record<string, unknown>) } as F;
  for (const [key, defaultValue] of Object.entries(defaultsConfig)) {
    if (key in (result as Record<string, unknown>)) {
      const fieldValue = (result as Record<string, unknown>)[key];
      if (fieldValue && typeof fieldValue === 'object' && 'objectFields' in fieldValue) {
        // This is an object field - recursively apply defaults to nested fields
        const fieldConfig = fieldValue as { objectFields?: Record<string, unknown>; default?: unknown };
        if (fieldConfig.objectFields && defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
          // Recursively apply defaults to nested objectFields
          fieldConfig.objectFields = applyDefaultsToFields(fieldConfig.objectFields, defaultValue as Record<string, unknown>);
        }
      } else if (fieldValue && typeof fieldValue === 'object' && 'type' in fieldValue) {
        // This is a regular field - update its default value
        const fieldConfig = fieldValue as { default?: unknown };
        fieldConfig.default = defaultValue;
      }
    }
  }
  return result;
}

/**
 * Processes internalFields configuration and returns processed fields
 * This handles omit, extend, and defaults - all field configuration modifications happen here
 *
 * The return type deep merges FieldConfiguration<P> with extended fields from ExtendedInternalFields
 *
 * @template P - The component props type (for FieldConfiguration)
 * @template InternalFields - The internal fields type (can be any object, not just InternalComponentFields | InternalRootComponentFields)
 * @template ExtendedInternalFields - Optional extended internal fields type
 */
export function processInternalFields<
  P extends object,
  InternalFields extends object = InternalComponentFields | InternalRootComponentFields,
  ExtendedInternalFields extends object | undefined = undefined,
>(
  fields: FieldConfiguration<P>,
  internalFieldsConfig: InternalFieldsConfig<InternalFields, ExtendedInternalFields, ExtractDataShape<FieldConfiguration<P>>> | undefined
): MergedFieldConfiguration<P, ExtendedInternalFields> {
  if (!internalFieldsConfig) {
    return fields as MergedFieldConfiguration<P, ExtendedInternalFields>;
  }

  let processedFields = { ...fields };

  // Apply omit first (remove fields we don't want)
  if (internalFieldsConfig.omit) {
    processedFields = applyOmitToFields(processedFields, internalFieldsConfig.omit);
  }

  // Apply extend next (add new fields)
  if (internalFieldsConfig.extend) {
    processedFields = applyExtendToFields(processedFields, internalFieldsConfig.extend as Record<string, unknown>);
  }

  // Apply defaults last (update default values in field configurations)
  if (internalFieldsConfig.defaults) {
    processedFields = applyDefaultsToFields(processedFields, internalFieldsConfig.defaults);
  }

  return processedFields as MergedFieldConfiguration<P, ExtendedInternalFields>;
}
