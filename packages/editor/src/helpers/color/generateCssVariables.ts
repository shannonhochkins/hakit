import { type Swatch } from './primary';

/**
 * Generate a CSS variables declaration string from swatch arrays.
 * Naming convention intentionally mirrors common design token patterns:
 *  - "--clr-primary-a0" for a primary scale swatch
 *  - "--clr-on-primary-a0" for its accessible text color ("on-" prefix widely used e.g. Material Design)
 *  - "--clr-surface-a0" / "--clr-on-surface-a0" for surface scale
 * You can override the root prefix (default "clr") or drop it entirely.
 * Optionally provide a map of scales so any future scales (e.g. accent) can reuse this.
 */
export interface CssVariableOptions {
  /** Prefix applied after the initial --. Example: prefix "clr" => --clr-primary-a0 */
  prefix?: string | null;
  /** Name to use for primary scale; default "primary" */
  primaryName?: string;
  /** Name to use for surface scale; default "surface" */
  surfaceName?: string;
  /** Include text (on-*) variables. Default true */
  includeText?: boolean;
  /** Custom formatter allowing full control; receives variable base parts */
  formatter?: (p: { scale: string; label: string; isText: boolean; prefix: string | null }) => string;
}

export function generateCssVariables(
  scales: {
    primary?: Swatch[];
    surface?: Swatch[];
    semantics?: Record<string, Swatch[] | undefined>; // success, warning, danger, info
  },
  options: CssVariableOptions = {}
): string {
  const { prefix = 'clr', primaryName = 'primary', surfaceName = 'surface', includeText = true, formatter } = options;

  const lines: string[] = [];

  function pushVars(scaleName: string, swatches: Swatch[] | undefined) {
    if (!swatches || swatches.length === 0) return;
    for (const s of swatches) {
      const base = formatter
        ? formatter({ scale: scaleName, label: s.label, isText: false, prefix })
        : `--${prefix ? prefix + '-' : ''}${scaleName}-${s.label}`;
      lines.push(`${base}: ${s.color};`);
      if (includeText && s.textColor) {
        const textVar = formatter
          ? formatter({ scale: scaleName, label: s.label, isText: true, prefix })
          : `--${prefix ? prefix + '-' : ''}on-${scaleName}-${s.label}`;
        lines.push(`${textVar}: ${s.textColor};`);
      }
    }
  }

  if (scales.primary) pushVars(primaryName, scales.primary);
  if (scales.surface) pushVars(surfaceName, scales.surface);

  if (scales.semantics) {
    for (const [name, arr] of Object.entries(scales.semantics)) {
      pushVars(name, arr || []);
    }
  }

  return lines.join('\n');
}

// Data structure for a single paired swatch (background + text/foreground)
export interface CssVariablePairData {
  background: string; // variable name without leading '--'
  backgroundValue: string; // color value
  text?: string; // variable name for text color (without '--') if present
  textValue?: string; // color value for text if present
  label: string; // original swatch label (e.g. a0, a10)
  scale: string; // scale name (primary, surface, success, etc.)
  prefix: string | null; // variable prefix eg 'clr'
}

// Generic mapped output: keys exactly match provided scale names.
// Primary and surface names are configurable; semantics keys come from the semantics record.
export type CssVariablesDataOutput<
  PName extends string,
  SName extends string,
  Semantics extends Record<string, Swatch[] | undefined> | undefined,
> = {
  [K in PName]?: CssVariablePairData[];
} & {
  [K in SName]?: CssVariablePairData[];
} & (Semantics extends Record<string, Swatch[] | undefined> ? { [K in keyof Semantics]?: CssVariablePairData[] } : Record<string, never>);

/**
 * Generate JSON representation of the same variables produced by generateCssVariables.
 * Each scale key contains an ordered array of swatch data objects.
 * Variable names exclude the leading `--` for easier consumption; prepend when needed.
 */
export function generateCssVariablesData<
  Sem extends Record<string, Swatch[] | undefined> | undefined,
  PName extends string = 'primary',
  SName extends string = 'surface',
>(
  scales: {
    primary?: Swatch[];
    surface?: Swatch[];
    semantics?: Sem;
  },
  options: CssVariableOptions & { primaryName?: PName; surfaceName?: SName } = {}
): CssVariablesDataOutput<PName, SName, Sem> {
  const { prefix = 'clr', primaryName = 'primary' as PName, surfaceName = 'surface' as SName, includeText = true, formatter } = options;

  // Use a mutable record then assert final strict type.
  const result: Record<string, CssVariablePairData[]> = {};

  function addScale(scaleName: string, swatches: Swatch[]) {
    if (!swatches.length) return;
    const arr: CssVariablePairData[] = [];
    for (const s of swatches) {
      const backgroundVar = formatter
        ? formatter({ scale: scaleName, label: s.label, isText: false, prefix })
        : `--${prefix ? prefix + '-' : ''}${scaleName}-${s.label}`;
      const item: CssVariablePairData = {
        background: backgroundVar.replace(/^--/, ''),
        backgroundValue: s.color,
        label: s.label,
        scale: scaleName,
        prefix,
      };
      if (includeText && s.textColor) {
        const textVar = formatter
          ? formatter({ scale: scaleName, label: s.label, isText: true, prefix })
          : `--${prefix ? prefix + '-' : ''}on-${scaleName}-${s.label}`;
        item.text = textVar.replace(/^--/, '');
        item.textValue = s.textColor;
      }
      arr.push(item);
    }
    result[scaleName] = arr;
  }

  if (scales.primary) addScale(primaryName, scales.primary);
  if (scales.surface) addScale(surfaceName, scales.surface);
  if (scales.semantics) {
    for (const [name, arr] of Object.entries(scales.semantics)) {
      addScale(name, arr || []);
    }
  }
  return result as CssVariablesDataOutput<PName, SName, Sem>;
}
