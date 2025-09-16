import { createCustomField } from '@helpers/editor/FieldContainer/Standard';
import type { FieldConfiguration, FieldConfigurationWithDefinition } from '@typings/fields';
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
 * 3. Applies automatic breakpoint logic (object, array, and divider fields get `responsiveMode: false`)
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
  fields: FieldConfiguration<P, DataShape>,
  isTopLevel: boolean = true
): FieldConfigurationWithDefinition<P> {
  // const result = {} as FieldConfigurationWithDefinition<P>;
  // for (const [fieldName, fieldDef] of typedEntries(fields)) {
  //   // Skip processing 'id' fields only at the top level (they are system fields for components)
  //   if (fieldName === 'id' && isTopLevel) {
  //     continue;
  //   }
  //   if (fieldDef.type === 'slot') {
  //     // If it's a slot field, we can just create it directly
  //     // @ts-expect-error - slots behave differently, we know this is fine
  //     result[fieldName] = fieldDef;
  //     continue;
  //   }
  //   // If it's an object field, recurse into objectFields
  //   if (fieldDef.type === 'object' && fieldDef.objectFields) {
  //     // @ts-expect-error - Fix later
  //     fieldDef.objectFields = transformFields(fieldDef.objectFields, false); // Not top level anymore
  //     // @ts-expect-error - Fix later
  //     result[fieldName] = createCustomField(fieldDef);
  //     // If it's an array field, recurse into arrayFields
  //   } else if (fieldDef.type === 'array' && fieldDef.arrayFields) {
  //     // @ts-expect-error - Fix later
  //     fieldDef.arrayFields = transformFields<P>(fieldDef.arrayFields, false); // Not top level anymore
  //     // @ts-expect-error - Fix later
  //     result[fieldName] = createCustomField(fieldDef);
  //     // Otherwise it’s just a normal field, no further recursion
  //   } else {
  //     // @ts-expect-error - Fix later
  //     result[fieldName] = createCustomField<P>(fieldDef);
  //   }
  // }
  // return result;
}

/**

 * Used for only root configurations so we can track which repository a field came from, and extract the data out
   This is primarily only used for the `visible` function so we can send over just the information relating to the current root data rather than all the data
 */
export function attachRepositoryReference<P extends DefaultComponentProps, DataShape = Omit<ComponentData<P>, 'type'>>(
  fields: FieldConfiguration<P, DataShape>,
  repositoryId: string = ''
): FieldConfiguration<P, true> {
  const result = {} as FieldConfiguration<P, true>;

  for (const [fieldName, fieldDef] of typedEntries(fields)) {
    // If it's an object field, recurse into objectFields
    if (fieldDef.type === 'object' && fieldDef.objectFields) {
      // @ts-expect-error - Fix later
      fieldDef.objectFields = attachRepositoryReference(fieldDef.objectFields, repositoryId); // Not top level anymore
      // @ts-expect-error - Fix later
      result[fieldName] = {
        ...fieldDef,
        repositoryId: repositoryId,
      };

      // If it's an array field, recurse into arrayFields
    } else if (fieldDef.type === 'array' && fieldDef.arrayFields) {
      // @ts-expect-error - Fix later
      fieldDef.arrayFields = attachRepositoryReference<P>(fieldDef.arrayFields, repositoryId); // Not top level anymore
      // @ts-expect-error - Fix later
      result[fieldName] = {
        ...fieldDef,
        repositoryId: repositoryId,
      };

      // Otherwise it’s just a normal field, no further recursion
    } else {
      // @ts-expect-error - Fix later
      result[fieldName] = {
        ...fieldDef,
        repositoryId: repositoryId,
      };
    }
  }
  return result;
}
