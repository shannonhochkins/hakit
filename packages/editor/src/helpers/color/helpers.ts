import Color from 'color';

export type ColorInstance = ReturnType<typeof Color>;

export function luminance(c: ColorInstance) {
  const { r, g, b } = c.rgb().object();
  const channels = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
export function contrastRatio(fg: ColorInstance, bg: ColorInstance) {
  const L1 = luminance(fg) + 0.05;
  const L2 = luminance(bg) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

export const WHITE = Color('#ffffff');
export const BLACK = Color('#000000');

export function chooseText(bgHex: string, fg: ColorInstance): string {
  let bg: ColorInstance;
  try {
    bg = Color(bgHex);
  } catch {
    return 'rgba(0,0,0,1)';
  }
  const cWhite = contrastRatio(WHITE, bg);
  const cBlack = contrastRatio(BLACK, bg);
  // Prefer AA Large (>=3), target AA normal (>=4.5), prefer AAA (>=7)
  const pick = () => {
    // Try achieving >=7 first
    if (cWhite >= 7 || cBlack >= 7) return cWhite >= cBlack ? WHITE : BLACK;
    // Then >=4.5
    if (cWhite >= 4.5 || cBlack >= 4.5) return cWhite >= cBlack ? WHITE : BLACK;
    // Fallback: whichever higher; if still <3 attempt primary color if contrast improved
    let candidate = cWhite >= cBlack ? WHITE : BLACK;
    const cPrimary = contrastRatio(fg, bg);
    if (cPrimary > contrastRatio(candidate, bg)) candidate = fg;
    return candidate;
  };
  const chosen = pick().rgb();
  const o = chosen.object();
  return `rgba(${o.r},${o.g},${o.b},1)`;
}

export function toRGBAString(hexOrColor: string | { r: number; g: number; b: number }, alpha: number) {
  if (typeof hexOrColor === 'string') {
    try {
      const c = Color(hexOrColor).rgb().object();
      return `rgba(${c.r},${c.g},${c.b},${alpha})`;
    } catch {
      return `rgba(0,0,0,${alpha})`;
    }
  }
  return `rgba(${hexOrColor.r},${hexOrColor.g},${hexOrColor.b},${alpha})`;
}
