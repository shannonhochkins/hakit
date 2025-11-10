import { DARK_MODE_LIGHTEN_SPAN, LIGHT_MODE_DARKEN_SPAN } from './constants';
import { chooseText, type ColorInstance, WHITE } from './helpers';
import { makePrimarySwatches, Swatch } from './primary';
import { makeSemanticSwatches } from './semantic';
import { makeSurfaceSwatches } from './surface';
import Color from 'color';

// TONALITY_MAX_BLEND:
// When you set tonalityMix to 1 we don't fully replace the surface color.
// Think of mixing paint: this cap means "at most half a cup of primary paint gets mixed into the surface bucket".
// So internal blend factor = userMix * TONALITY_MAX_BLEND.
export const TONALITY_MAX_BLEND = 0.3;

export interface ColorSwatches {
  primary: Swatch[];
  surface: Swatch[];
  semantics: {
    success: Swatch[];
    warning: Swatch[];
    danger: Swatch[];
    info: Swatch[];
  };
}

export function generateColorSwatches({
  primary,
  surface,
  success,
  warning,
  danger,
  info,
  lightMode,
  tonalityMix = 0,
  surfaceOpts = {
    lightModeDarkenSpan: LIGHT_MODE_DARKEN_SPAN,
    darkModeLightenSpan: DARK_MODE_LIGHTEN_SPAN,
  },
}: {
  primary?: string;
  surface?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  lightMode?: boolean;
  tonalityMix?: number;
  surfaceOpts?: {
    lightModeDarkenSpan: number;
    darkModeLightenSpan: number;
  };
}): ColorSwatches {
  const lm = !!lightMode;
  const mixInput = Math.max(0, Math.min(1, tonalityMix));
  const mix = mixInput * TONALITY_MAX_BLEND; // scale down so 1 => 50% actual blend
  const primarySwatches = primary ? makePrimarySwatches(primary, lm) : [];
  const surfaceSwatches = surface ? makeSurfaceSwatches(surface, lm, surfaceOpts) : [];
  const semanticSwatches = makeSemanticSwatches({
    lightMode,
    success,
    warning,
    danger,
    info,
  });

  // Post-mix primary with surface for overlapping indices (a0..a70) when mix > 0
  if (mix > 0) {
    for (let i = 0; i < surfaceSwatches.length; i++) {
      const s = surfaceSwatches[i];
      // map to first primary swatches if available (a0..a70), else blend with base primary color
      if (i < primarySwatches.length) {
        const p = primarySwatches[i];
        const sc = Color(s.color);
        const pc = Color(p.color);
        const blended = sc.mix(pc, mix).rgb().round();
        const o = blended.object();
        surfaceSwatches[i] = { ...s, color: `rgba(${o.r},${o.g},${o.b},${blended.alpha()})` };
      }
    }
  }
  // Provide primary color fallback for low-contrast cases
  let primaryBase: ColorInstance;
  try {
    primaryBase = Color(primary);
  } catch {
    primaryBase = WHITE;
  }

  // Attach text colors
  for (const s of primarySwatches) {
    s.textColor = chooseText(s.color, primaryBase);
  }
  for (const s of surfaceSwatches) {
    s.textColor = chooseText(s.color, primaryBase);
  }
  return {
    primary: primarySwatches,
    surface: surfaceSwatches,
    semantics: semanticSwatches,
  };
}
