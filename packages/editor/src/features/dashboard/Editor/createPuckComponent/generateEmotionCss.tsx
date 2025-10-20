import { SerializedStyles } from '@emotion/react';
import { serializeStyles } from '@emotion/serialize';
import { useGlobalStore } from '@hooks/useGlobalStore';

export interface StyleStrings {
  componentStyles: string | undefined;
  overrideStyles: string | undefined;
}

/**
 * Generate emotion CSS within the iframe context where the correct emotion cache is active.
 * This ensures styles are added to the iframe's head rather than the parent document's head.
 */
export function generateEmotionCss(styles?: StyleStrings): SerializedStyles | undefined {
  const emotionCache = useGlobalStore.getState().emotionCache;

  if (!styles || (!styles.componentStyles && !styles.overrideStyles)) {
    return undefined;
  }

  try {
    const componentCss = styles.componentStyles?.trim() || '';
    const overrideCss = styles.overrideStyles?.trim() || '';
    if (!overrideCss && !componentCss) {
      return undefined;
    }
    const result = serializeStyles([componentCss, overrideCss], emotionCache?.registered, emotionCache?.key);
    return result;
  } catch (error) {
    console.error('HAKIT: Error generating emotion CSS in iframe context:', error);
    console.error('Error details:', error);
    return undefined;
  }
}
