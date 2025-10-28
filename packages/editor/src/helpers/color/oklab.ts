// Minimal OKLab/OKLCH conversion utilities (adapted from Bjorn Ottosson's OKLab reference implementation)
// Avoid external dependency; used with Color library.

export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface OKLab {
  L: number;
  a: number;
  b: number;
}
export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

function srgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function linearToSrgb(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

export function rgbToOklab({ r, g, b }: RGB): OKLab {
  // assume r,g,b in 0..1
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6309787005 * bl;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

export function oklabToRgb({ L, a, b }: OKLab): RGB {
  const l_ = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  const rl = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gl = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
  return {
    r: Math.min(1, Math.max(0, linearToSrgb(rl))),
    g: Math.min(1, Math.max(0, linearToSrgb(gl))),
    b: Math.min(1, Math.max(0, linearToSrgb(bl))),
  };
}

export function oklabToOklch({ L, a, b }: OKLab): OKLCH {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}
export function oklchToOklab({ l, c, h }: OKLCH): OKLab {
  const hr = (h * Math.PI) / 180;
  return { L: l, a: c * Math.cos(hr), b: c * Math.sin(hr) };
}

export function rgbToOklch(rgb: RGB): OKLCH {
  return oklabToOklch(rgbToOklab(rgb));
}
export function oklchToRgb(oklch: OKLCH): RGB {
  return oklabToRgb(oklchToOklab(oklch));
}
