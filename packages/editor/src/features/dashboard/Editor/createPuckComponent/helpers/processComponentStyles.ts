import { type SerializedStyles } from '@emotion/react';
import { type CSSInterpolation } from '@emotion/serialize';
import { generateCssForInternalProps } from './generateCssForInternalProps';
import {
  generateEmotionCss,
  getSerializedStyles,
  type StyleInputs,
} from '@features/dashboard/Editor/createPuckComponent/helpers/generateEmotionCss';

type ComponentType = 'component' | 'root';

export interface ProcessComponentStylesOptions {
  /** Component props that may contain internal fields */
  props: Record<string, unknown>;
  /** Component type - 'root' or 'component' */
  type: ComponentType;
  /** Optional component-specific styles from config.styles */
  componentStyles?: string | SerializedStyles | CSSInterpolation;
  /** Optional override styles from props.$styles?.css */
  overrideStyles?: string;
}

/**
 * Wraps CSS variables in :root selector for root components
 */
function wrapCssVariablesInRoot(cssVariables: Record<string, string | number>): string {
  const cssVarsString = Object.entries(cssVariables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `:root {\n${cssVarsString}\n}`;
}

/**
 * Unified CSS processing for both root and component styles.
 * Handles CSS variables, internal styles, component styles, and override styles.
 *
 * The ONLY difference between root and component is that root wraps CSS variables in `:root { ... }`.
 * Everything else uses identical logic through emotion.
 */
export function processComponentStyles({
  props,
  type,
  componentStyles,
  overrideStyles,
}: ProcessComponentStylesOptions): string | SerializedStyles | undefined {
  // Generate CSS for internal fields (appearance, layout, typography, theme)
  const { cssVariables, cssStyles: internalCssStyles } = generateCssForInternalProps(props, type);

  // Build the same CSSInterpolation array for both root and component
  const componentStylesArray: CSSInterpolation[] = [];

  // Add CSS variables - for root, wrap in :root selector
  // generateCssForInternalProps always returns Record<string, string> or undefined for cssVariables
  if (cssVariables) {
    if (type === 'root') {
      // Root: wrap in :root selector and add as string
      componentStylesArray.push(wrapCssVariablesInRoot(cssVariables));
    } else {
      // Component: add as object directly
      componentStylesArray.push(cssVariables);
    }
  }

  // Add internal CSS styles (same for both)
  if (internalCssStyles) {
    componentStylesArray.push(internalCssStyles);
  }

  // Add component-specific styles (same for both)
  if (componentStyles) {
    const serialized = getSerializedStyles(componentStyles);
    if (serialized) {
      componentStylesArray.push(serialized);
    } else if (typeof componentStyles === 'string') {
      componentStylesArray.push(componentStyles);
    } else {
      componentStylesArray.push(componentStyles);
    }
  }

  // Generate emotion CSS (same for both)
  const styleInputs: StyleInputs = {
    componentStyles: componentStylesArray,
    overrideStyles,
    preSerializedStyles: componentStyles ? getSerializedStyles(componentStyles) : undefined,
  };

  const emotionCss = generateEmotionCss(styleInputs);

  // For root, convert SerializedStyles to string for <Global> component
  // For component, return SerializedStyles as-is for css prop
  const styles =
    type === 'root' && emotionCss
      ? // Extract CSS string from SerializedStyles for root
        emotionCss.styles
      : emotionCss;

  return styles;
}
