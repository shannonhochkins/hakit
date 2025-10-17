// Runtime validators and onChange helpers for CustomAutoField
// Keeps the component lean and centralizes type expectations per field kind

import { PageValue } from '@typings/fields';

export type Primitive = string | number | boolean | undefined | unknown;

export function validateString<T extends Primitive, F extends Primitive>(value: T, fallback: F): T | F {
  return typeof value === 'string' ? value : fallback;
}

export function validateNumber<T extends Primitive, F extends Primitive>(value: T, fallback: F): T | F {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function validateBoolean<T extends Primitive, F extends Primitive>(value: T, fallback: F): T | F {
  return typeof value === 'boolean' ? value : fallback;
}

export function validateStringArray<T extends Primitive, F extends Primitive>(value: T[], fallback: F[]): T[] | F[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string') ? (value as T[]) : fallback;
}

export function validatePageValue<T extends PageValue, F extends PageValue>(value: T, fallback: F): T | F {
  return typeof value === 'object' && 'dashboardId' in value && 'pageId' in value ? value : fallback;
}

export function validatePageValueArray<T extends PageValue, F extends PageValue>(value: T[], fallback: F[]): T[] | F[] {
  return Array.isArray(value) && value.every(v => typeof v === 'object' && 'dashboardId' in v && 'pageId' in v) ? (value as T[]) : fallback;
}

export function validateJson<T extends Primitive, F extends object>(value: T, fallback: F): T | F {
  return typeof value === 'object' ? value : fallback;
}
