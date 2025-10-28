import { makePrimarySwatches, type Swatch } from './primary';
import Color from 'color';

// Semantic color defaults
const SEMANTIC_DEFAULTS = {
  success: '#22946E',
  warning: '#A87A2A',
  danger: '#9C2121',
  info: '#21498A',
} as const;

export const SEMANTIC_COUNT = 4; // adjustable later if needed

// Assign text colors using same logic as generateColorSwatches by reusing chooseText.
// Extracted minimal contrast helpers (duplicated to avoid refactor of existing function scope)
function luminanceHex(hex: string) {
  const c = Color(hex);
  const { r, g, b } = c.rgb().object();
  const channels = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrastHex(fg: string, bg: string) {
  const L1 = luminanceHex(fg) + 0.05;
  const L2 = luminanceHex(bg) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}
const WHITE = '#ffffff';
const BLACK = '#000000';

function chooseText(bg: string) {
  let fg = WHITE;
  const cW = contrastHex(WHITE, bg);
  const cB = contrastHex(BLACK, bg);
  if (cW >= 7 || cB >= 7) fg = cW >= cB ? WHITE : BLACK;
  else if (cW >= 4.5 || cB >= 4.5) fg = cW >= cB ? WHITE : BLACK;
  else fg = cW >= cB ? WHITE : BLACK; // fallback
  return fg;
}

export function generateSemanticSwatches({
  success = SEMANTIC_DEFAULTS.success,
  warning = SEMANTIC_DEFAULTS.warning,
  danger = SEMANTIC_DEFAULTS.danger,
  info = SEMANTIC_DEFAULTS.info,
  lightMode,
  hueShiftScale,
  endcapLightnessDark,
  endcapLightnessLight,
}: {
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  lightMode?: boolean;
  hueShiftScale?: number;
  endcapLightnessDark?: number;
  endcapLightnessLight?: number;
}) {
  const lm = !!lightMode;
  function makeSemantic(color: string): Swatch[] {
    return makePrimarySwatches(color, lm, {
      semantic: true,
      hueShiftScale,
      endcapLightnessDark,
      endcapLightnessLight,
    });
  }
  const successScale = makeSemantic(success);
  const warningScale = makeSemantic(warning);
  const dangerScale = makeSemantic(danger);
  const infoScale = makeSemantic(info);

  [successScale, warningScale, dangerScale, infoScale].forEach(scale => {
    for (const s of scale) s.textColor = chooseText(s.color);
  });

  return {
    success: successScale,
    warning: warningScale,
    danger: dangerScale,
    info: infoScale,
  };
}
