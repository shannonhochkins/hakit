import { makePrimarySwatches } from './primary';
import { makeSurfaceSwatches } from './surface';
import Color from 'color';

// TONALITY_MAX_BLEND:
// When you set tonalityMix to 1 we don't fully replace the surface color.
// Think of mixing paint: this cap means "at most half a cup of primary paint gets mixed into the surface bucket".
// So internal blend factor = userMix * TONALITY_MAX_BLEND.
export const TONALITY_MAX_BLEND = 0.3;

export function generateColorSwatches({
  primary,
  surface,
  lightMode,
  tonalityMix = 0,
}: {
  primary: string;
  surface: string;
  lightMode?: boolean;
  tonalityMix?: number;
}) {
  const lm = !!lightMode;
  const mixInput = Math.max(0, Math.min(1, tonalityMix));
  const mix = mixInput * TONALITY_MAX_BLEND; // scale down so 1 => 50% actual blend
  const primarySwatches = makePrimarySwatches(primary, lm);
  const surfaceSwatches = makeSurfaceSwatches(surface, lm);

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

  // Text color generation: choose best of white/black for each swatch via WCAG contrast.
  type ColorInstance = ReturnType<typeof Color>;
  function luminance(c: ColorInstance) {
    const { r, g, b } = c.rgb().object();
    const channels = [r, g, b].map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }
  function contrastRatio(fg: ColorInstance, bg: ColorInstance) {
    const L1 = luminance(fg) + 0.05;
    const L2 = luminance(bg) + 0.05;
    return L1 > L2 ? L1 / L2 : L2 / L1;
  }
  const WHITE = Color('#ffffff');
  const BLACK = Color('#000000');
  // Provide primary color fallback for low-contrast cases
  let primaryBase: ColorInstance;
  try {
    primaryBase = Color(primary);
  } catch {
    primaryBase = WHITE;
  }

  function chooseText(bgHex: string): string {
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
      const cPrimary = contrastRatio(primaryBase, bg);
      if (cPrimary > contrastRatio(candidate, bg)) candidate = primaryBase;
      return candidate;
    };
    const chosen = pick().rgb();
    const o = chosen.object();
    return `rgba(${o.r},${o.g},${o.b},1)`;
  }

  // Attach text colors
  for (const s of primarySwatches) {
    s.textColor = chooseText(s.color);
  }
  for (const s of surfaceSwatches) {
    s.textColor = chooseText(s.color);
  }

  return {
    primary: primarySwatches,
    surface: surfaceSwatches,
  };
}
