import { DefaultComponentProps, Slot } from '@measured/puck';
import { DefaultPropsCallbackData } from '@typings/puck';
import type { FieldConfiguration } from '@typings/fields';
import { EntityName } from '@hakit/core';
import { UnitFieldValue } from '@typings/fields';

type DummyFields = {
  text: string;
  number: number;
  boolean: boolean;
  entity: EntityName;
  radio: string | number | boolean | null;
  slot: Slot;
  unit: UnitFieldValue;
  object: {
    unit: UnitFieldValue;
    text: string;
    number: number;
    boolean: boolean;
    entity: EntityName;
    radio: string | number | boolean | null;
    slot: Slot;
    object: DummyFields;
    array: DummyFields[];
  };
  array: DummyFields[];
};

/**
 * Recursively gathers default values from fields definitions.
 */
export async function getDefaultPropsFromFields<P extends DefaultComponentProps = DefaultComponentProps>(
  _fields: FieldConfiguration<P>,
  data: DefaultPropsCallbackData
): Promise<P> {
  const result: DefaultComponentProps = {};
  const fields = _fields as FieldConfiguration<DummyFields>;
  // intentionally re-casting so we can get the correct types whilst checking, key names don't matter here, only the value types.

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (fieldDef.type === 'hidden') {
      continue;
    }

    if (fieldDef.type === 'entity') {
      const options =
        typeof fieldDef.filterOptions === 'function'
          ? await fieldDef.filterOptions(Object.values(data.entities))
          : Object.values(data.entities);
      // if the user hasn't provided a default function, we can't use the entity field
      if (typeof fieldDef.default !== 'function') {
        continue;
      }
      result[fieldName] = await fieldDef.default(options);
      fieldDef.default = result[fieldName];
    } else if (fieldDef.type === 'object') {
      // If it's an object, recurse into objectFields
      const nestedDefaults: DefaultComponentProps = {};
      if (fieldDef.objectFields && typeof fieldDef.objectFields === 'object') {
        for (const [nestedFieldName, nestedFieldDef] of Object.entries(fieldDef.objectFields)) {
          if (nestedFieldDef.type === 'entity') {
            const options =
              typeof nestedFieldDef.filterOptions === 'function'
                ? await nestedFieldDef.filterOptions(Object.values(data.entities))
                : Object.values(data.entities);
            if (typeof nestedFieldDef.default !== 'function') {
              continue;
            }
            nestedDefaults[nestedFieldName] = await nestedFieldDef.default(options);
            // update the default value so the function is transformed internally
            nestedFieldDef.default = nestedDefaults[nestedFieldName];
          } else {
            if (nestedFieldDef.type === 'slot') continue; // skip slot types
            nestedDefaults[nestedFieldName] =
              nestedFieldDef.type === 'object' && typeof nestedFieldDef.objectFields === 'object'
                ? await getDefaultPropsFromFields(nestedFieldDef.objectFields as P, data)
                : // @ts-expect-error - We precompute the default based on nested fields values
                  nestedFieldDef.default;
          }
        }
      }
      // @ts-expect-error - We precompute the default based on nested fields values
      // so the user doesn't have to specify a default for objects and fields
      fieldDef.default = nestedDefaults;
      result[fieldName] = nestedDefaults;
    } else if (fieldDef.type === 'array') {
      const nestedArrayDefaults: DefaultComponentProps = {};
      if (fieldDef.arrayFields) {
        for (const [key, nestedArrayField] of Object.entries(fieldDef.arrayFields)) {
          if (nestedArrayField?.type === 'entity') {
            const options =
              typeof nestedArrayField?.filterOptions === 'function'
                ? await nestedArrayField.filterOptions(Object.values(data.entities))
                : Object.values(data.entities);
            nestedArrayDefaults[key] = await nestedArrayField.default(options);
            nestedArrayField.default = nestedArrayDefaults[key];
          } else {
            if (nestedArrayField?.type === 'slot') continue; // skip slot types
            nestedArrayDefaults[key] =
              nestedArrayField?.type === 'object' && typeof nestedArrayField?.objectFields === 'object'
                ? await getDefaultPropsFromFields(nestedArrayField.objectFields as P, data)
                : // @ts-expect-error - We precompute the default based on nested fields values
                  nestedArrayField.default;
          }
        }
        result[fieldName] = [nestedArrayDefaults];
      } else {
        throw new Error('Array fields must have arrayFields defined');
      }
    } else {
      if (fieldDef.type === 'slot') continue; // skip slot types
      // Otherwise just use the "default" value directly
      result[fieldName] = fieldDef.default;
    }
  }
  return result as P;
}
