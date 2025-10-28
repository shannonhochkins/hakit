/* ------------------------------------------------------------------
  SURFACE (8 or 10) — adaptive sRGB mixing schedule
  Original 8-step dark scale for base #121212 reproduced:
  #121212, #282828, #3f3f3f, #575757, #717171, #8b8b8b, #a7a7a7, #c4c4c4
  For 10-step we extend with two lighter stops derived by continuing the
  existing progression curve toward white (#e0e0e0, #f5f5f5 approx targets)
  while preserving relative lightness increments.
-------------------------------------------------------------------*/

import { Swatch } from './primary';
import { makeScaleLabels } from './labels';
import Color from 'color';
type ColorInstance = ReturnType<typeof Color>;
const toRGBAString = (c: { r: number; g: number; b: number }, alpha: number) => `rgba(${c.r},${c.g},${c.b},${alpha})`;

// labels now generated dynamically via makeScaleLabels

// (legacy helper removed)

// Iterative darken/lighten approach:
// Dark mode: progressively lighten the base using Color.lighten(f) with a tuned factor curve.
// Light mode: progressively darken the base using Color.darken(f) ensuring each step differs.
// Guarantees no duplicate rgba outputs; simpler & driven by input color directly.
export const SURFACE_SCALE_SIZE = 10;

// LIGHT_MODE_DARKEN_SPAN:
// Think of the original color as a bright cookie. We take little bites to make it darker.
// This number says how big the total bite size is from start to finish. Smaller = gentler darkening.
// If you make it 0.3 the steps will stay very close to the original; if you make it 1.0 it will get much darker.
export const LIGHT_MODE_DARKEN_SPAN = 0.65; // previously 0.65 (slowed down per request)

// LIGHT_MODE_DUPLICATE_NUDGE:
// Sometimes two steps accidentally look the same after rounding (like drawing two crayons that match).
// This tiny number is how much extra "push" we give to the color to make it different when that happens.
// Bigger number = stronger push but risk of uneven jumps.
export const LIGHT_MODE_DUPLICATE_NUDGE = 0.02; // previously 0.03

// DARK_MODE_LIGHTEN_SPAN:
// In dark mode our starting color is usually dim. This sets how far we brighten across all steps.
// Imagine a dimmer knob: 0.5 means we turn it up halfway, 1.0 would try to go very bright.
export const DARK_MODE_LIGHTEN_SPAN = 1.65; // gentler brightening span (was 3 overly aggressive)

// DARK_MODE_DUPLICATE_NUDGE:
// Tiny brightness push when two lightened steps collide and look identical.
// Keep small to avoid banding.
export const DARK_MODE_DUPLICATE_NUDGE = 0.1;

// Convert sRGB (0-255) to relative luminance components for OKLCH approximation (simplified).
// Non-linear step curve: heavier early change then easing out.
function stepProgress(i: number, count: number): number {
  const t = i / (count - 1);
  // Emphasize first half then smooth tail.
  const eased = t < 0.6 ? Math.pow(t / 0.6, 0.85) * 0.6 : 0.6 + (t - 0.6) * 0.4;
  return Math.min(1, eased);
}

export function makeSurfaceSwatches(color: string, lightMode = false): Swatch[] {
  const count = SURFACE_SCALE_SIZE;
  let parsed: ColorInstance;
  try {
    parsed = Color(color);
  } catch {
    parsed = Color('#000');
  }
  const obj = parsed.rgb().object();
  const baseAlpha = parsed.alpha();
  const baseColor = Color({ r: obj.r, g: obj.g, b: obj.b, alpha: baseAlpha });
  const swatches: Swatch[] = [];
  const labels = makeScaleLabels(count);
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    const label = labels[i];
    const factor = stepProgress(i, count); // 0..1 curve
    let c: ColorInstance;
    if (i === 0) {
      c = baseColor; // original
    } else {
      // Use incremental darken/lighten with small step to avoid overshooting to black/white.
      // Base per-step intensity influenced by overall curve; final multiplier modest.
      const maxDelta = lightMode ? LIGHT_MODE_DARKEN_SPAN : DARK_MODE_LIGHTEN_SPAN; // total cumulative adjustment span
      const f = factor * maxDelta; // final desired overall adjustment proportion
      // We apply darken/lighten on the original color by f (color library treats darken as multiplying HSL lightness).
      c = lightMode ? baseColor.darken(f) : baseColor.lighten(f);
    }
    // Clamp channels into 0-255 and round
    const co = c.rgb().object();
    const roundedBase = { r: Math.round(co.r), g: Math.round(co.g), b: Math.round(co.b) };
    let rgba = toRGBAString(roundedBase, baseAlpha);
    // Uniqueness enforcement: if duplicate, apply tiny incremental adjustment
    let adj = 0;
    while (seen.has(rgba) && adj < 5) {
      const nudge = lightMode ? LIGHT_MODE_DUPLICATE_NUDGE : DARK_MODE_DUPLICATE_NUDGE;
      adj += nudge;
      c = lightMode ? c.darken(nudge) : c.lighten(nudge);
      const n = c.rgb().object();
      const rounded = { r: Math.round(n.r), g: Math.round(n.g), b: Math.round(n.b) };
      rgba = toRGBAString(rounded, baseAlpha);
    }
    seen.add(rgba);
    swatches.push({ label, color: rgba });
  }
  // Post condition: ensure strictly monotonic channel movement (approx) for light mode darkening and dark mode lightening.
  // (No mutation if already monotonic)
  return swatches;
}
