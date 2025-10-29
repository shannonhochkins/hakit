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
    primary: Swatch[];
    surface: Swatch[];
    semantics?: Record<string, Swatch[]>; // success, warning, danger, info
  },
  options: CssVariableOptions = {}
): string {
  const { prefix = 'clr', primaryName = 'primary', surfaceName = 'surface', includeText = true, formatter } = options;

  const lines: string[] = [];

  function pushVars(scaleName: string, swatches: Swatch[]) {
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

  pushVars(primaryName, scales.primary);
  pushVars(surfaceName, scales.surface);

  if (scales.semantics) {
    for (const [name, arr] of Object.entries(scales.semantics)) {
      pushVars(name, arr);
    }
  }

  return lines.join('\n');
}
