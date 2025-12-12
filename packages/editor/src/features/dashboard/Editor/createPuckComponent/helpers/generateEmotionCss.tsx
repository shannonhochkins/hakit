import { css, type SerializedStyles } from '@emotion/react';
import { type CSSInterpolation } from '@emotion/serialize';

export interface StyleInputs {
  componentStyles: CSSInterpolation[];
  overrideStyles: string | undefined;
  preSerializedStyles?: SerializedStyles;
}

// create a default style that adds max-width: fit-content; to everything
export const defaultStyles = {
  maxWidth: 'fit-content',
  position: 'relative',
  overflow: 'hidden',
} as const;

/**
 * Generate emotion CSS within the iframe context where the correct emotion cache is active.
 * This ensures styles are added to the iframe's head rather than the parent document's head.
 * Accepts CSS objects for better type safety and testability.
 */
export function generateEmotionCss({
  fitToContent = true,
  styles,
}: {
  fitToContent: boolean;
  styles?: StyleInputs;
}): SerializedStyles | undefined {
  if (!styles) return undefined;

  const cssInputs: CSSInterpolation[] = [
    ...styles.componentStyles.map(s => (typeof s === 'string' ? s.trim() : s)).filter(Boolean),
    ...(styles.overrideStyles ? [styles.overrideStyles] : []),
    ...(styles.preSerializedStyles ? [styles.preSerializedStyles] : []),
  ];

  if (cssInputs.length === 0) return undefined;

  return css(...cssInputs, {
    ...defaultStyles,
    maxWidth: fitToContent ? defaultStyles.maxWidth : undefined,
  });
}

export function getSerializedStyles(obj: unknown): SerializedStyles | undefined {
  if (typeof obj === 'object' && obj !== null && 'name' in obj && 'styles' in obj) {
    return obj as SerializedStyles;
  }
  return undefined;
}
