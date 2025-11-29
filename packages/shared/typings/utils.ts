import type { UnitFieldValue } from '@typings/fields';

// Helper type to convert UnitFieldValue to string recursively
// This is used to simplify UnitFieldValue in props passed to styles/render functions
export type SimplifyUnitFieldValue<T> = T extends UnitFieldValue
  ? string
  : T extends object
    ? { [K in keyof T]: SimplifyUnitFieldValue<T[K]> }
    : T;

// DeepPartial that simplifies UnitFieldValue to string to avoid TS2590 errors
// The template literal in UnitFieldValue creates 2401+ union members which causes
// "union type too complex" errors when used with DeepPartial in styles/render functions
// Field definitions still use the full UnitFieldValue type for validation
export type DeepPartial<T> = SimplifyUnitFieldValue<{
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
}>;
