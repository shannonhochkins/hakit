// Runtime validators and onChange helpers for CustomAutoField
// Keeps the component lean and centralizes type expectations per field kind

export type Primitive = string | number | boolean | undefined;

export function validateString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function validateNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function validateBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function validateStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every(v => typeof v === 'string') ? (value as string[]) : undefined;
}

export function validateNumberArray(value: unknown): number[] | undefined {
  return Array.isArray(value) && value.every(v => typeof v === 'number' && Number.isFinite(v)) ? (value as number[]) : undefined;
}

export function validateBooleanArray(value: unknown): boolean[] | undefined {
  return Array.isArray(value) && value.every(v => typeof v === 'boolean') ? (value as boolean[]) : undefined;
}

// Factory helpers for onChange to reduce ad-hoc casting at call sites
export const onChangeString = (fn: unknown) => (val: string) => (fn as (v: string) => void)(val);
export const onChangeNumber = (fn: unknown) => (val: number) => (fn as (v: number) => void)(val);
export const onChangeBoolean = (fn: unknown) => (val: boolean) => (fn as (v: boolean) => void)(val);
export const onChangeStringArray = (fn: unknown) => (val: string[]) => (fn as (v: string[]) => void)(val);
export const onChangeNumberArray = (fn: unknown) => (val: number[]) => (fn as (v: number[]) => void)(val);
export const onChangeBooleanArray = (fn: unknown) => (val: boolean[]) => (fn as (v: boolean[]) => void)(val);
