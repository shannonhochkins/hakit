import type { FieldConfiguration } from '@typings/fields';
import type { ComponentData, DefaultComponentProps } from '@measured/puck';

function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Used for only root configurations so we can track which addon a field came from, and extract the data out
 * This is primarily only used for the `visible` function so we can send over just the information relating to the current root data rather than all the data
 */
export function attachAddonReference<P extends DefaultComponentProps, DataShape = Omit<ComponentData<P>, 'type'>>(
  fields: FieldConfiguration<P, DataShape>,
  addonId: string = ''
): FieldConfiguration<P, true> {
  const result = {} as FieldConfiguration<P, true>;

  for (const [fieldName, fieldDef] of typedEntries(fields)) {
    // If it's an object field, recurse into objectFields
    if (fieldDef.type === 'object') {
      // @ts-expect-error - Fix later
      fieldDef.objectFields = attachAddonReference(fieldDef.objectFields ?? {}, addonId); // Not top level anymore
      // @ts-expect-error - Fix later
      result[fieldName] = {
        ...fieldDef,
        addonId: addonId,
      };

      // If it's an array field, recurse into arrayFields
    } else if (fieldDef.type === 'array') {
      // @ts-expect-error - Fix later
      fieldDef.arrayFields = attachAddonReference<P>(fieldDef.arrayFields ?? {}, addonId); // Not top level anymore
      // @ts-expect-error - Fix later
      result[fieldName] = {
        ...fieldDef,
        addonId: addonId,
      };

      // Otherwise it's just a normal field, no further recursion
    } else {
      // @ts-expect-error - Fix later
      result[fieldName] = {
        ...fieldDef,
        addonId: addonId,
      };
    }
  }
  return result;
}
