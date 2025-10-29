import { makePrimarySwatches, type Swatch } from './primary';
import Color, { ColorInstance } from 'color';
import { contrastRatio, WHITE, BLACK } from './helpers';

// Semantic color defaults
export const SEMANTIC_DEFAULTS = {
  success: '#22946E',
  warning: '#A87A2A',
  danger: '#9C2121',
  info: '#21498A',
} as const;

export const SEMANTIC_COUNT = 4; // adjustable later if needed

function chooseText(bg: ColorInstance) {
  let fg = WHITE;
  const cW = contrastRatio(WHITE, bg);
  const cB = contrastRatio(BLACK, bg);
  if (cW >= 7 || cB >= 7) fg = cW >= cB ? WHITE : BLACK;
  else if (cW >= 4.5 || cB >= 4.5) fg = cW >= cB ? WHITE : BLACK;
  else fg = cW >= cB ? WHITE : BLACK; // fallback
  return fg;
}

export function makeSemanticSwatches({
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
    for (const s of scale) s.textColor = chooseText(Color(s.color)).toString();
  });

  return {
    success: successScale,
    warning: warningScale,
    danger: dangerScale,
    info: infoScale,
  };
}
