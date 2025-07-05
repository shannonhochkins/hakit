import { createCustomField } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/createCustomField';
import type { CustomFieldsConfiguration } from '@typings/fields';
import type { ComponentData, DefaultComponentProps } from '@measured/puck';

function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Transforms raw field configurations into Puck-compatible custom fields.
 *
 * This function recursively processes a field configuration object and converts each field
 * definition into a Puck custom field using `createCustomField`. The transformation:
 *
 * 1. Recursively processes nested object and array fields
 * 2. Wraps each field definition in a custom field with a `_field` property containing the original configuration
 * 3. Applies automatic breakpoint logic (object, array, and divider fields get `disableBreakpoints: true`)
 *
 * @template P - The component props type extending DefaultComponentProps
 * @template DataShape - The shape of the component data, defaults to Omit<ComponentData<P>, 'type'>
 *
 * @param fields - The raw field configuration object with field definitions
 * @returns A transformed field configuration where each field is a Puck custom field with the original config stored in `_field`
 *
 * @example
 * ```typescript
 * const rawFields = {
 *   title: { type: 'text', label: 'Title', default: '' },
 *   settings: {
 *     type: 'object',
 *     label: 'Settings',
 *     objectFields: {
 *       theme: { type: 'select', label: 'Theme', options: [...], default: 'light' }
 *     }
 *   }
 * };
 *
 * const transformedFields = transformFields(rawFields);
 * // Result: Each field becomes { type: 'custom', _field: originalConfig, render: Function }
 * ```
 */
export function transformFields<P extends DefaultComponentProps, DataShape = Omit<ComponentData<P>, 'type'>>(
  fields: CustomFieldsConfiguration<P, false, DataShape>
): CustomFieldsConfiguration<P, true> {
  const result = {} as CustomFieldsConfiguration<P, true>;

  for (const [fieldName, fieldDef] of typedEntries(fields)) {
    // If it's an object field, recurse into objectFields
    if (fieldDef.type === 'object' && fieldDef.objectFields) {
      // @ts-expect-error - Fix later
      fieldDef.objectFields = transformFields(fieldDef.objectFields);
      // @ts-expect-error - Fix later
      result[fieldName] = createCustomField(fieldDef);

      // If it's an array field, recurse into arrayFields
    } else if (fieldDef.type === 'array' && fieldDef.arrayFields) {
      // @ts-expect-error - Fix later
      fieldDef.arrayFields = transformFields<P>(fieldDef.arrayFields);
      // @ts-expect-error - Fix later
      result[fieldName] = createCustomField(fieldDef);

      // Otherwise it’s just a normal field, no further recursion
    } else {
      // @ts-expect-error - Fix later
      result[fieldName] = createCustomField<P>(fieldDef);
    }
  }
  return result;
}
