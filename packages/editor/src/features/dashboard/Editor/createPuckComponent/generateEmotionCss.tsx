import { css, type SerializedStyles } from '@emotion/react';

export interface StyleStrings {
  componentStyles: string[];
  overrideStyles: string | undefined;
  preSerializedStyles?: SerializedStyles;
}

/**
 * Generate emotion CSS within the iframe context where the correct emotion cache is active.
 * This ensures styles are added to the iframe's head rather than the parent document's head.
 */
export function generateEmotionCss(styles?: StyleStrings): SerializedStyles | undefined {
  if (!styles) return undefined;
  const raw = [...styles.componentStyles, styles.overrideStyles]
    .filter(Boolean)
    .map(s => s?.trim())
    .filter(Boolean)
    .join('\n');
  return css(raw, styles.preSerializedStyles);
}

export function getSerializedStyles(obj: unknown): SerializedStyles | undefined {
  if (typeof obj === 'object' && obj !== null && 'name' in obj && 'styles' in obj) {
    return obj as SerializedStyles;
  }
  return undefined;
}
