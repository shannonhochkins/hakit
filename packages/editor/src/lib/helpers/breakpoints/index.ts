import { type BreakPoint } from '@hakit/components';
import { DefaultComponentProps } from '@measured/puck';
import { type CustomFields, type CustomFieldsConfiguration, type CustomFieldsWithDefinition } from '@lib/components/Form';
import { createCustomField } from '@lib/components/Form';
import { type UserConfig } from '@typings/puck';
import { DefaultPropsCallbackData } from '@typings';
// import { DefaultPropsCallbackData } from '@typings';

// Adjust or confirm your actual ordering:
export const BREAKPOINT_ORDER: BreakPoint[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xlg'];

function isBreakpointObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value == null) return false;

  // Check if it has at least one known breakpoint key:
  const keys = Object.keys(value);
  return keys.some(k => BREAKPOINT_ORDER.includes(k as BreakPoint));
}

export function multipleBreakpointsEnabled(value: unknown): boolean {
  if (!isBreakpointObject(value)) return false;
  return Object.keys(value).length > 1;
}

export function getResolvedBreakpointValue<T>(value: unknown, active: BreakPoint): T {
  if (!isBreakpointObject(value)) return value as T;

  const startIndex = BREAKPOINT_ORDER.indexOf(active);

  // From the active breakpoint onward...
  for (let i = startIndex; i < BREAKPOINT_ORDER.length; i++) {
    const bp = BREAKPOINT_ORDER[i];
    if (value[bp] != null) {
      // Found a defined value
      return value[bp] as T;
    }
  }
  // If we somehow get here (we shouldn’t, because xlg is guaranteed),
  // just fallback to `xlg` explicitly:
  return value.xlg as T;
}
const excludeList = ['key', 'children', 'puck', 'editMode', 'id'] as const;
type ExcludedKeys = typeof excludeList[number];
type BreakpointMap<T> = Partial<Record<BreakPoint, T>>;

type TransformProps<T> = 
  T extends BreakpointMap<infer U> ? TransformProps<U> :
  T extends Array<infer U> ? TransformProps<U>[] :
  T extends object ? {
    [K in keyof T]:
      K extends ExcludedKeys
        ? T[K]
        : TransformProps<T[K]>
  } :
  T;
// Main function that transforms props recursively, including array items.
export function transformProps<P extends object>(props: P, active: BreakPoint): TransformProps<P> {
  // null/undefined => just return
  if (props == null) {
    return props;
  }

  // If it's an array, transform each item
  if (Array.isArray(props)) {
    return props.map(item => transformProps(item, active)) as unknown as TransformProps<P>;
  }

  // If it's a plain object
  if (typeof props === 'object') {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(props)) {
      // If key is excluded, just copy as-is
      if (excludeList.includes(key as ExcludedKeys)) {
        result[key] = (props as Record<string, unknown>)[key];
        continue;
      }

      // Resolve breakpoint if it's shaped like one
      const value = (props as Record<string, unknown>)[key];
      const resolved = getResolvedBreakpointValue(value, active);

      // Now recurse on that resolved value (it could itself be an object/array)
      result[key] = transformProps(resolved as P, active);
    }

    return result as TransformProps<P>;
  }

  // If it's a primitive (string, number, boolean, etc.), return as-is
  return props;
}

/**
 * Takes an object of defaults (e.g. `{ width: 100, gap: 20 }`) and
 * transforms each property to `{ xlg: ... }`.
 *
 * Example:
 *   wrapDefaults({ width: 100, gap: 20 })
 *   => { width: { xlg: 100 }, gap: { xlg: 20 } }
 */

export function wrapDefaults<T extends DefaultComponentProps = DefaultComponentProps>(
  fields: DefaultComponentProps,
  defaultProps: DefaultComponentProps
): T {
  if (!defaultProps) return {} as T;

  // We'll accumulate our transformed defaults here
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(defaultProps)) {
    const value = defaultProps[key];

    if (typeof value === 'undefined') continue;
    // intentionally using any here so that the types extract the _field types properly internally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = fields[key] as CustomFieldsWithDefinition<any> | undefined;

    // If there's no "_field" definition, we assume a standard field and copy value as-is
    if (!field?._field) {
      result[key] = value;
      continue;
    }

    if (field?._field.type === 'hidden') {
      continue;
    }

    const { disableBreakpoints, type } = field._field;

    // If it's an object field with its own subfields:
    if (type === 'object' && field._field.objectFields && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Do NOT wrap the top-level object in breakpoints if disableBreakpoints is false,
      // since you specifically want each subfield to decide individually.
      // We just recurse.
      result[key] = wrapDefaults(field._field.objectFields, value as DefaultComponentProps);
    } else if (type === 'array' && field._field.arrayFields && Array.isArray(value)) {
      // If breakpoints are disabled => do NOT wrap the array.
      // Instead, transform each item using arrayFields (so subfields can get individually wrapped or not).
      if (disableBreakpoints) {
        if (field._field.arrayFields) {
          const arrayFields = field._field.arrayFields;
          // Recurse on each item with arrayFields
          result[key] = (value as unknown[]).map(item => wrapDefaults(arrayFields, item as DefaultComponentProps));
        } else {
          // No subfields => just copy the array
          result[key] = value;
        }
      } else {
        // If breakpoints are NOT disabled => wrap the entire array in { xlg: ... }
        // (matching your test requirement).
        // We do *not* individually transform items here, because the test specifically
        // wants the items themselves unwrapped (they’re effectively treated as a single chunk).
        result[key] = { xlg: value };
      }
    } else {
      // It's a non-object (or no nested subfields).
      // If breakpoints are disabled here, just copy the value.
      // Otherwise wrap it in { xlg: value }.
      if (disableBreakpoints) {
        result[key] = value;
      } else {
        result[key] = { xlg: value };
      }
    }
  }

  return result as T;
}

function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export function transformFields<P extends DefaultComponentProps>(fields: CustomFieldsConfiguration<P>): CustomFieldsConfiguration<P, true> {
  const result = {} as CustomFieldsConfiguration<P, true>;

  for (const [fieldName, fieldDef] of typedEntries(fields)) {
    if (fieldDef.type === 'hidden') {
      continue;
    }
    // If it's an object field, recurse into objectFields
    if (fieldDef.type === 'object' && fieldDef.objectFields) {
      // @ts-expect-error - Fix later
      fieldDef.objectFields = transformFields(fieldDef.objectFields);
      result[fieldName] = createCustomField(fieldDef);

      // If it's an array field, recurse into arrayFields
    } else if (fieldDef.type === 'array' && fieldDef.arrayFields) {
      // @ts-expect-error - Fix later
      fieldDef.arrayFields = transformFields<P>(fieldDef.arrayFields);
      result[fieldName] = createCustomField(fieldDef);

      // Otherwise it’s just a normal field, no further recursion
    } else {
      // @ts-expect-error - Fix later
      result[fieldName] = createCustomField<P>(fieldDef);
    }
  }
  return result;
}

/**
 * Recursively gathers default values from fields definitions.
 */
export async function getDefaultPropsFromFields<P extends DefaultComponentProps>(
  fields: CustomFieldsConfiguration<P>,
  data: DefaultPropsCallbackData
): Promise<P> {
  const result: DefaultComponentProps = {};
  // intentionally re-casting so we can get the correct types whilst checking, key names don't matter here, only the value types.
  const _fields = fields as Record<string, CustomFields>;

  for (const [fieldName, fieldDef] of Object.entries(_fields)) {
    if (fieldDef.type === 'hidden') {
      continue;
    }

    if (fieldDef.type === 'entity') {
      if (typeof fieldDef.options === 'function')  {
        fieldDef.options = await fieldDef.options(data);
      }
      result[fieldName] = await fieldDef.default(fieldDef.options, data);
      fieldDef.default = result[fieldName];
      
    } else if (fieldDef.type === 'object') {
      // If it's an object, recurse into objectFields
      const nestedDefaults: DefaultComponentProps = {};
      if (fieldDef.objectFields) {
        for (const [nestedFieldName, nestedFieldDef] of Object.entries(fieldDef.objectFields)) {
          if (nestedFieldDef.type === 'entity') {
            if (typeof nestedFieldDef.options === 'function') {
              nestedFieldDef.options = await nestedFieldDef.options(data);
            }
            nestedDefaults[nestedFieldName] = await nestedFieldDef.default(nestedFieldDef.options, data);
            // update the default value so the function is transformed internally
            nestedFieldDef.default = nestedDefaults[nestedFieldName];
          } else {
            nestedDefaults[nestedFieldName] =
            nestedFieldDef.type === 'object'
              ? await getDefaultPropsFromFields(nestedFieldDef.objectFields as CustomFieldsConfiguration, data)
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
          if (nestedArrayField.type === 'entity') {
            if (typeof nestedArrayField.options === 'function') {
              nestedArrayField.options = await nestedArrayField.options(data);
            }
            nestedArrayDefaults[key] = await nestedArrayField.default(nestedArrayField.options, data);
            nestedArrayField.default = nestedArrayDefaults[key];
            
          } else {
            nestedArrayDefaults[key] =
              nestedArrayField.type === 'object'
                ? await getDefaultPropsFromFields(nestedArrayField.objectFields as CustomFieldsConfiguration, data)
                : nestedArrayField.default;
          }
        }
        result[fieldName] = [nestedArrayDefaults];
      } else {
        throw new Error('Array fields must have arrayFields defined');
      }
    } else {
      // Otherwise just use the "default" value directly
      result[fieldName] = fieldDef.default;
    }
  }
  return result as P;
}
