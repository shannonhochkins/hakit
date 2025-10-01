import { DefaultComponentProps } from '@measured/puck';
import { DefaultPropsCallbackData } from '@typings/puck';
import type { FieldConfiguration, InternalComponentFields } from '@typings/fields';

/**
 * Recursively gathers default values from fields definitions.
 */
export async function getDefaultPropsFromFields<P extends DefaultComponentProps>(
  fields: FieldConfiguration<P & InternalComponentFields>,
  data: DefaultPropsCallbackData
): Promise<P> {
  const result: DefaultComponentProps = {};
  // intentionally re-casting so we can get the correct types whilst checking, key names don't matter here, only the value types.

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (fieldDef.type === 'hidden') {
      continue;
    }

    if (fieldDef.type === 'entity') {
      if (typeof fieldDef.filterOptions === 'function') {
        fieldDef.options = await fieldDef.filterOptions(Object.values(data.entities));
      } else {
        fieldDef.options = Object.values(data.entities);
      }
      result[fieldName] = await fieldDef.default(fieldDef.options);
      fieldDef.default = result[fieldName];
    } else if (fieldDef.type === 'object') {
      // If it's an object, recurse into objectFields
      const nestedDefaults: DefaultComponentProps = {};
      if (fieldDef.objectFields) {
        for (const [nestedFieldName, nestedFieldDef] of Object.entries(fieldDef.objectFields)) {
          if (nestedFieldDef.type === 'entity') {
            if (typeof nestedFieldDef.filterOptions === 'function') {
              nestedFieldDef.options = await nestedFieldDef.filterOptions(Object.values(data.entities));
            } else {
              nestedFieldDef.options = Object.values(data.entities);
            }
            nestedDefaults[nestedFieldName] = await nestedFieldDef.default(nestedFieldDef.options);
            // update the default value so the function is transformed internally
            nestedFieldDef.default = nestedDefaults[nestedFieldName];
          } else {
            if (nestedFieldDef.type === 'slot') continue; // skip slot types
            nestedDefaults[nestedFieldName] =
              nestedFieldDef.type === 'object'
                ? await getDefaultPropsFromFields(nestedFieldDef.objectFields as FieldConfiguration, data)
                : nestedFieldDef.default;
          }
        }
      }
      fieldDef.default = nestedDefaults;
      result[fieldName] = nestedDefaults;
    } else if (fieldDef.type === 'array') {
      const nestedArrayDefaults: DefaultComponentProps = {};
      if (fieldDef.arrayFields) {
        for (const [key, nestedArrayField] of Object.entries(fieldDef.arrayFields)) {
          if (typeof key !== 'string') continue; // skip non-string keys
          if (nestedArrayField.type === 'entity') {
            if (typeof nestedArrayField.filterOptions === 'function') {
              nestedArrayField.options = await nestedArrayField.filterOptions(Object.values(data.entities));
            } else {
              nestedArrayField.options = Object.values(data.entities);
            }
            nestedArrayDefaults[key] = await nestedArrayField.default(nestedArrayField.options);
            nestedArrayField.default = nestedArrayDefaults[key];
          } else {
            if (nestedArrayField.type === 'slot') continue; // skip slot types
            nestedArrayDefaults[key] =
              nestedArrayField.type === 'object'
                ? await getDefaultPropsFromFields(nestedArrayField.objectFields as FieldConfiguration, data)
                : nestedArrayField.default;
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
