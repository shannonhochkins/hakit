import { anchors } from './primaryAnchorSteps';
import { makeScaleLabels } from './labels';
import Color from 'color';
import { rgbToOklch, oklchToRgb } from './oklab';
import { toRGBAString } from './helpers';

export interface Swatch {
  label: string; // a0, a10, ...
  color: string; // rgba(...) or #rrggbb
  textColor?: string; // computed accessible text color for this swatch
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// PRIMARY_LIGHT_TARGET:
// When we "add light" to the color we aim near this lightness (like aiming for a bright wall but not blinding).
// Keeping it < 1 avoids pure white which kills hue completely.
export const PRIMARY_LIGHT_TARGET = 0.98;

// PRIMARY_DARK_TARGET:
// When we "take away light" (light mode inverse) we move toward this darker floor instead of pure black to retain hue hints.
export const PRIMARY_DARK_TARGET = 0.02;

// PRIMARY_SEMANTIC_LIGHT_END / PRIMARY_SEMANTIC_DARK_END:
// Semantic scales avoid extreme ends so they stay more usable for badges/pills.
export const PRIMARY_SEMANTIC_LIGHT_END = 0.92;
export const PRIMARY_SEMANTIC_DARK_END = 0.3;

// PRIMARY_SEMANTIC_HUE_SHIFT_SCALE:
// How strongly we let hue drift on semantic scales (smaller keeps base hue more intact).
export const PRIMARY_SEMANTIC_HUE_SHIFT_SCALE = 0.3;

// PRIMARY_PROGRESS_NORMALIZATION:
// Anchor progress arrays peak below 1; we divide by this so math feels like full range 0..1.
export const PRIMARY_PROGRESS_NORMALIZATION = 0.88;

// PRIMARY_LIGHT_MODE_CHROMA_DROP:
// How much chroma (colorfulness) we lose as we darken in light mode; higher number = faster greying.
export const PRIMARY_LIGHT_MODE_CHROMA_DROP = 0.85;

// PRIMARY_SEMANTIC_CHROMA_RET_LIGHT / DARK:
// Chroma retention factors semantic mode (keep more color early so it reads as intent).
export const PRIMARY_SEMANTIC_CHROMA_RET_LIGHT = 0.6; // during darkening
export const PRIMARY_SEMANTIC_CHROMA_RET_DARK = 0.9; // during lightening

// PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE:
// Reduce hue shift strength in light mode to avoid wild swings.
export const PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE = 0.5;

// PRIMARY_GAUSSIAN_DENOMINATOR:
// Controls how quickly anchor influence fades with hue distance. Smaller = sharper cutoff.
export const PRIMARY_GAUSSIAN_DENOMINATOR = 40;

/* ------------------------------------------------------------------
   PRIMARY (10) — adaptive OKLCH based scale
   Approach:
   1. Convert base to OKLCH.
   2. Generate lighter sequence by interpolating toward L=0.98, C decreases.
   3. Apply slight hue drift proportional to chroma loss (toward 20° for warm reds, 230° for cool blues).
  4. Convert back to sRGB via OKLCH conversion; clamp.
   5. Keep first color exact base, last color pure white.
   This removes hard-coded calibration and works for arbitrary base hues.
-------------------------------------------------------------------*/

interface OKLCH {
  l: number;
  c: number;
  h: number;
}
type ColorInstance = ReturnType<typeof Color>;
const toOKLCH = (c: ColorInstance): OKLCH => {
  const { r, g, b } = c.object();
  const o = rgbToOklch({ r: r / 255, g: g / 255, b: b / 255 });
  return { l: o.l, c: o.c, h: o.h };
};

export const PRIMARY_SCALE_SIZE = 10;
export const SEMANTIC_PRIMARY_SIZE = 4;

export function makePrimarySwatches(
  color: string,
  lightMode = false,
  opts?: {
    semantic?: boolean;
    hueShiftScale?: number;
    endcapLightnessDark?: number;
    endcapLightnessLight?: number;
    semanticStepsIndices?: number[];
  }
): Swatch[] {
  const isSemantic = !!opts?.semantic;
  const count = isSemantic ? SEMANTIC_PRIMARY_SIZE : PRIMARY_SCALE_SIZE;
  let parsed: ColorInstance;
  try {
    parsed = Color(color);
  } catch {
    return Array.from({ length: count }, (_, i) => {
      const step = Math.round((i * 90) / (count - 1));
      const label = i === 0 ? 'a0' : `a${step}`;
      return { label, color: i === count - 1 ? 'rgba(255,255,255,1)' : toRGBAString(color, 1) };
    });
  }
  const o = toOKLCH(parsed);
  const baseL = o.l;
  const baseC = o.c;
  const baseH = (o.h ?? 0) % 360;
  // Extract alpha from original color (parsed -> rgb)
  let baseAlpha = 1;
  // Color stores alpha; default 1 if unspecified
  baseAlpha = parsed.alpha();

  // Blend anchor arrays by hue distance using Gaussian weights.
  function blendStep(stepIndex: number) {
    let wSum = 0;
    let prog = 0;
    let cRet = 0;
    let hShift = 0;
    for (const a of anchors) {
      const d = Math.min(Math.abs(baseH - a.hue), Math.abs(baseH - a.hue + 360), Math.abs(baseH - a.hue - 360));
      const w = Math.exp(-((d / PRIMARY_GAUSSIAN_DENOMINATOR) ** 2)); // narrower spread for crisper transitions
      wSum += w;
      prog += a.progress[stepIndex] * w;
      cRet += a.chromaRet[stepIndex] * w;
      hShift += a.hueShift[stepIndex] * w;
    }
    return { progress: prog / wSum, chromaRet: cRet / wSum, hueShift: hShift / wSum };
  }

  const tints: { l: number; c: number; h: number }[] = [];
  if (!isSemantic) {
    // Original 10-step base uses 8 intermediate tints (excluding a0 & a90 endcaps)
    for (let i = 0; i < 8; i++) {
      const blended = blendStep(i);
      if (!lightMode) {
        const L = baseL + (PRIMARY_LIGHT_TARGET - baseL) * blended.progress;
        const C = baseC * blended.chromaRet;
        const H = (baseH + blended.hueShift + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      } else {
        const inv = blended.progress;
        const L = baseL * (1 - inv) + PRIMARY_DARK_TARGET * inv; // toward near-black floor constant
        const C = baseC * (1 - inv * PRIMARY_LIGHT_MODE_CHROMA_DROP);
        const H = (baseH + blended.hueShift * PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      }
    }
  } else {
    // Semantic mode: constrained lightness/chroma drift, fewer steps, no pure white/black endcaps.
    const hueScale = opts?.hueShiftScale ?? PRIMARY_SEMANTIC_HUE_SHIFT_SCALE;
    const endcapLightDark = clamp01(opts?.endcapLightnessDark ?? PRIMARY_SEMANTIC_LIGHT_END); // less than 1 (avoid pure white)
    const endcapLightLight = clamp01(opts?.endcapLightnessLight ?? PRIMARY_SEMANTIC_DARK_END); // avoid pure black
    // Choose anchor indices for 3 intermediate steps (excluding base). Defaults spread across progression.
    const stepIndices = opts?.semanticStepsIndices ?? [1, 3, 6];
    for (let sIdx = 0; sIdx < stepIndices.length; sIdx++) {
      const anchorIndex = stepIndices[sIdx];
      const blended = blendStep(anchorIndex);
      if (!lightMode) {
        // Lighten toward limited target
        const targetL = endcapLightDark;
        const progressNorm = blended.progress / PRIMARY_PROGRESS_NORMALIZATION; // approximate normalization
        const L = baseL + (targetL - baseL) * progressNorm;
        const C = baseC * (PRIMARY_SEMANTIC_CHROMA_RET_DARK * blended.chromaRet); // retain a bit more chroma
        const H = (baseH + blended.hueShift * hueScale + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      } else {
        // Darken toward limited target
        const targetL = endcapLightLight;
        const progressNorm = blended.progress / PRIMARY_PROGRESS_NORMALIZATION;
        const L = baseL * (1 - progressNorm) + targetL * progressNorm;
        const C = baseC * (1 - progressNorm * PRIMARY_SEMANTIC_CHROMA_RET_LIGHT); // keep chroma longer
        const H = (baseH + blended.hueShift * hueScale + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      }
    }
  }

  // Labels
  const labels = !isSemantic ? makeScaleLabels(count) : Array.from({ length: count }, (_, i) => `a${i * 10}`); // semantic: a0,a10,a20,a30
  const swatches: Swatch[] = [];
  for (let i = 0; i < count; i++) {
    if (!isSemantic && i === count - 1) {
      // original endcap (extreme)
      const end = !lightMode ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
      swatches.push({ label: labels[i], color: toRGBAString(end, baseAlpha) });
      continue;
    }
    if (i === 0) {
      // base color
      const { r, g, b } = parsed.rgb().object();
      swatches.push({ label: labels[i], color: `rgba(${r},${g},${b},${baseAlpha})` });
      continue;
    }
    // In semantic mode tints length == count-1; mapping still tint[i-1]
    const tint = tints[i - 1];
    const rgb = oklchToRgb({ l: clamp01(tint.l), c: Math.max(0, tint.c), h: tint.h });
    swatches.push({
      label: labels[i],
      color: `rgba(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)},${baseAlpha})`,
    });
  }
  return swatches;
}
