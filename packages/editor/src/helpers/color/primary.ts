import { anchors } from './primaryAnchorSteps';
import { makeScaleLabels } from './labels';
import Color from 'color';
import { rgbToOklch, oklchToRgb } from './oklab';
import { toRGBAString } from './helpers';
import {
  SWATCH_COUNT,
  PRIMARY_LIGHT_TARGET,
  PRIMARY_DARK_TARGET,
  PRIMARY_LIGHT_MODE_CHROMA_DROP,
  PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE,
  PRIMARY_GAUSSIAN_DENOMINATOR,
  PRIMARY_SEMANTIC_HUE_SHIFT_SCALE,
  PRIMARY_SEMANTIC_CHROMA_RET_DARK,
  PRIMARY_SEMANTIC_CHROMA_RET_LIGHT,
  PRIMARY_SEMANTIC_LIGHT_END,
  PRIMARY_SEMANTIC_DARK_END,
  PRIMARY_PROGRESS_NORMALIZATION,
} from './constants';

export interface Swatch {
  label: string; // a0, a10, ...
  color: string; // rgba(...) or #rrggbb
  textColor?: string; // computed accessible text color for this swatch
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

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
  const count = SWATCH_COUNT;
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

  // (Legacy helper blendStep removed; fractional blending now handled inline to support arbitrary counts.)

  const tints: { l: number; c: number; h: number }[] = [];
  if (!isSemantic) {
    // Interpolate anchor arrays to support arbitrary count.
    // We have original discrete indices 0..(origSteps-1) where origSteps = anchors[0].progress.length (8).
    const origSteps = anchors[0].progress.length;
    const intermediates = Math.max(0, count - 2);
    for (let i = 0; i < intermediates; i++) {
      const frac = intermediates <= 1 ? 0 : i / (intermediates - 1); // 0..1
      // Map frac onto original index space [0, origSteps-1]
      const rawIndex = frac * (origSteps - 1);
      const i0 = Math.floor(rawIndex);
      const i1 = Math.min(origSteps - 1, i0 + 1);
      const localT = rawIndex - i0;
      // Interpolated blended values
      let wSum = 0,
        prog = 0,
        cRet = 0,
        hShift = 0;
      for (const a of anchors) {
        const d = Math.min(Math.abs(baseH - a.hue), Math.abs(baseH - a.hue + 360), Math.abs(baseH - a.hue - 360));
        const w = Math.exp(-((d / PRIMARY_GAUSSIAN_DENOMINATOR) ** 2));
        wSum += w;
        const p0 = a.progress[i0];
        const p1 = a.progress[i1];
        const c0 = a.chromaRet[i0];
        const c1 = a.chromaRet[i1];
        const h0 = a.hueShift[i0];
        const h1 = a.hueShift[i1];
        const p = p0 + (p1 - p0) * localT;
        const cR = c0 + (c1 - c0) * localT;
        const hS = h0 + (h1 - h0) * localT;
        prog += p * w;
        cRet += cR * w;
        hShift += hS * w;
      }
      const blended = { progress: prog / wSum, chromaRet: cRet / wSum, hueShift: hShift / wSum };
      if (!lightMode) {
        const L = baseL + (PRIMARY_LIGHT_TARGET - baseL) * blended.progress;
        const C = baseC * blended.chromaRet;
        const H = (baseH + blended.hueShift + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      } else {
        const inv = blended.progress;
        const L = baseL * (1 - inv) + PRIMARY_DARK_TARGET * inv;
        const C = baseC * (1 - inv * PRIMARY_LIGHT_MODE_CHROMA_DROP);
        const H = (baseH + blended.hueShift * PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      }
    }
  } else {
    // Semantic mode: produce (count-1) moderated steps between base and constrained endcaps.
    // We avoid extreme white/black so hue/chroma remain recognizable.
    const hueScale = opts?.hueShiftScale ?? PRIMARY_SEMANTIC_HUE_SHIFT_SCALE;
    const targetLightL = clamp01(opts?.endcapLightnessDark ?? PRIMARY_SEMANTIC_LIGHT_END);
    const targetDarkL = clamp01(opts?.endcapLightnessLight ?? PRIMARY_SEMANTIC_DARK_END);
    const steps = count - 1; // excluding base
    const origSteps = anchors[0].progress.length;
    for (let i = 0; i < steps; i++) {
      // Normalized fraction 0..1 across semantic progression
      const frac = steps <= 1 ? 1 : (i + 1) / steps; // start at first tint beyond base
      // Map frac onto anchor space (excluding index 0 to preserve base)
      const rawIndex = frac * (origSteps - 1);
      const anchorIndex = Math.min(origSteps - 1, Math.max(1, rawIndex));
      // Blend using fractional anchor index by linear interpolation
      const i0 = Math.floor(anchorIndex);
      const i1 = Math.min(origSteps - 1, i0 + 1);
      const localT = anchorIndex - i0;
      let wSum = 0,
        prog = 0,
        cRet = 0,
        hShift = 0;
      for (const a of anchors) {
        const d = Math.min(Math.abs(baseH - a.hue), Math.abs(baseH - a.hue + 360), Math.abs(baseH - a.hue - 360));
        const w = Math.exp(-((d / PRIMARY_GAUSSIAN_DENOMINATOR) ** 2));
        wSum += w;
        const p = a.progress[i0] + (a.progress[i1] - a.progress[i0]) * localT;
        const cR = a.chromaRet[i0] + (a.chromaRet[i1] - a.chromaRet[i0]) * localT;
        const hS = a.hueShift[i0] + (a.hueShift[i1] - a.hueShift[i0]) * localT;
        prog += p * w;
        cRet += cR * w;
        hShift += hS * w;
      }
      const blended = { progress: prog / wSum, chromaRet: cRet / wSum, hueShift: hShift / wSum };
      const progressNorm = blended.progress / PRIMARY_PROGRESS_NORMALIZATION;
      if (!lightMode) {
        // Lighten toward moderated light target
        const L = baseL + (targetLightL - baseL) * progressNorm;
        const C = baseC * (PRIMARY_SEMANTIC_CHROMA_RET_DARK * blended.chromaRet);
        const H = (baseH + blended.hueShift * hueScale + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      } else {
        // Darken toward moderated dark target
        const L = baseL * (1 - progressNorm) + targetDarkL * progressNorm;
        const C = baseC * (1 - progressNorm * PRIMARY_SEMANTIC_CHROMA_RET_LIGHT);
        const H = (baseH + blended.hueShift * hueScale + 360) % 360;
        tints.push({ l: L, c: C, h: H });
      }
    }
  }

  // Labels
  // Generate labels; semantic keeps evenly distributed indices based on total count.
  const labels = makeScaleLabels(count);
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
    if (!tint) continue;
    const rgb = oklchToRgb({ l: clamp01(tint.l), c: Math.max(0, tint.c), h: tint.h });
    swatches.push({
      label: labels[i],
      color: `rgba(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)},${baseAlpha})`,
    });
  }
  return swatches;
}
