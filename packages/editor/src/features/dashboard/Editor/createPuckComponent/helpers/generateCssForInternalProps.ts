import { generateColorSwatches } from '@helpers/color';
import { generateCssVariables } from '@helpers/color/generateCssVariables';
import { InternalComponentFields, InternalRootComponentFields } from '@typings/fields';
import { fontFamilyMap } from '@features/dashboard/Editor/Typography';
import { sanitizeFilterId } from '@components/LiquidGlass';

type InternalFields = InternalComponentFields | InternalRootComponentFields;
type ComponentType = 'component' | 'root';

export interface GenerateCssForInternalPropsResult {
  cssVariables: Record<string, string> | undefined;
  cssStyles: Record<string, string | number> | undefined;
}

/**
 * Generates CSS for all internal fields ($appearance, $styles, etc.)
 * Only creates CSS rules when values are available (optimization)
 * Returns CSS objects for better type safety and testability
 *
 * @param props - Component props that may contain internal fields
 * @param type - 'component' or 'root' - determines if theme swatches should be generated
 * @returns Object with cssVariables and cssStyles as CSS objects
 */
export function generateCssForInternalProps(
  props: Record<string, unknown>,
  type: ComponentType = 'component'
): GenerateCssForInternalPropsResult {
  const appearance = '$appearance' in props ? (props.$appearance as InternalFields['$appearance']) : undefined;

  const cssVariablesObj: Record<string, string> = {};
  const cssStylesObj: Record<string, string | number> = {};

  // Generate theme CSS variables (only for root, or component when override is true)
  if (appearance?.theme) {
    const shouldGenerateTheme = type === 'root' || appearance.theme.override === true;
    if (shouldGenerateTheme && appearance.theme.colors) {
      const themeColors = appearance.theme.colors;
      if (themeColors.semantics) {
        const swatches = generateColorSwatches({
          ...themeColors,
          success: themeColors.semantics.success,
          warning: themeColors.semantics.warning,
          danger: themeColors.semantics.danger,
          info: themeColors.semantics.info,
        });
        // Parse the generated CSS variables string into an object
        const cssVarsString = generateCssVariables(swatches);
        if (cssVarsString) {
          cssVarsString.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed) {
              const match = trimmed.match(/^--([^:]+):\s*(.+);?$/);
              if (match) {
                cssVariablesObj[`--${match[1].trim()}`] = match[2].trim();
              }
            }
          });
        }
      }
    }
  }

  // Generate background CSS - use direct values (no CSS variables)
  if (appearance?.design) {
    const d = appearance.design;
    // don't allow glass for root components
    const isGlassBackground = d.backgroundType === 'glass' && type !== 'root';
    const isLiquidGlassBackground = d.backgroundType === 'liquid-glass' && type !== 'root';
    const isBackgroundColor = d.backgroundType === 'color' || type === 'root';

    // Generate CSS rules with direct values
    if (d.backgroundColor && isBackgroundColor) {
      cssStylesObj.backgroundColor = d.backgroundColor;
    }

    if (d.boxShadowEnabled === true && type !== 'root') {
      cssStylesObj.boxShadow = ` 0 4px ${d.boxShadowBlur ?? 30}px ${d.boxShadowSpread ?? 0}px ${d.boxShadowColor ?? 'rgba(0,0,0,0.1)'};`;
    }

    if (d.borderRadius && type !== 'root') {
      cssStylesObj.borderRadius = d.borderRadius;
    }

    if (!isGlassBackground && !isLiquidGlassBackground) {
      if (d.borderEnabled === true) {
        cssStylesObj.border = `${d.borderWidth} ${d.borderStyle ?? 'solid'} ${d.borderColor}`;
      }
    }

    if (isGlassBackground) {
      const glassColor = d.glassColor || 'rgba(255, 255, 255, 0.2)';
      const percent = Math.round((d.glassOutlineTransparency ?? 0.81) * 100);
      const borderColor = `color-mix(in srgb, ${glassColor} ${percent}%, transparent)`;
      const borderWidth = `${d.glassOutline ?? 1}px`;
      cssStylesObj.backgroundColor = glassColor;
      cssStylesObj.backdropFilter = `blur(${d.glassBlurAmount ?? `5`}px)`;
      cssStylesObj.WebkitBackdropFilter = `blur(${d.glassBlurAmount ?? `5`}px)`;
      cssStylesObj.border = `${borderWidth} solid ${borderColor}`;
    }
    if (isLiquidGlassBackground) {
      const percent = Math.round((d.glassOutlineTransparency ?? 0.81) * 100);
      const borderWidth = `${d.glassOutline ?? 1}px`;
      let glassColor = d.glassColor || 'rgba(255, 255, 255, 0.2)';
      // intentionally using the input glassColor here, not the color mix below, otherwise it may be too transparent
      const borderColor = `color-mix(in srgb, ${glassColor} ${percent}%, transparent)`;

      const a = Math.round(Math.max(0, Math.min(1, d.glassBackgroundOpacity ?? 0.1)) * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
      if (/^#([0-9a-f]{6})$/i.test(glassColor)) glassColor = `${glassColor}${a}`;
      // non-hex → fallback using color-mix so opacity still applies
      const pct = Math.round((d.glassBackgroundOpacity ?? 0.1) * 100);
      glassColor = `color-mix(in oklab, ${glassColor} ${pct}%, transparent)`;

      cssStylesObj.backgroundColor = glassColor;
      cssStylesObj.border = `${borderWidth} solid ${borderColor}`;
      cssStylesObj.overflow = 'hidden';
      cssStylesObj.position = 'relative';
      const filterId = sanitizeFilterId(`liquid-glass-${props.id}`);
      cssStylesObj.backdropFilter = `url(#${filterId})`;
      cssStylesObj.WebkitBackdropFilter = `url(#${filterId})`;
    }

    if (d.useImage && d.backgroundImage) {
      cssStylesObj.backgroundImage = `url(${d.backgroundImage})`;

      if (d.backgroundImageBlendMode && d.backgroundImageBlendMode !== 'normal') {
        cssStylesObj.backgroundBlendMode = d.backgroundImageBlendMode;
      }

      if (d.backgroundSize && d.backgroundSize !== 'auto') {
        const bgSize = d.backgroundSize === 'custom' ? (d.backgroundSizeCustom ?? 'cover') : d.backgroundSize;
        cssStylesObj.backgroundSize = bgSize;
      }

      if (d.backgroundPosition) {
        cssStylesObj.backgroundPosition = d.backgroundPosition;
      }

      if (d.backgroundRepeat && d.backgroundRepeat !== 'no-repeat') {
        cssStylesObj.backgroundRepeat = d.backgroundRepeat;
      }

      if (d.backgroundAttachment && d.backgroundAttachment !== 'scroll') {
        cssStylesObj.backgroundAttachment = d.backgroundAttachment;
      }
    }

    // for root, we want to generate css variables only for the background properties
    if (type === 'root') {
      // reference the above values from the cssStylesObj, if they exist, create a css variable for them, then delete the value from the cssStylesObj
      if (cssStylesObj.backgroundColor) {
        cssVariablesObj['--ha-background-color'] = String(cssStylesObj.backgroundColor);
        delete cssStylesObj.backgroundColor;
      }
      if (cssStylesObj.backgroundImage) {
        cssVariablesObj['--ha-background-image'] = String(cssStylesObj.backgroundImage);
        delete cssStylesObj.backgroundImage;
      }
      if (cssStylesObj.backgroundSize && cssStylesObj.backgroundSize !== 'auto') {
        cssVariablesObj['--ha-background-size'] = String(cssStylesObj.backgroundSize);
        delete cssStylesObj.backgroundSize;
      }
      if (cssStylesObj.backgroundPosition) {
        cssVariablesObj['--ha-background-position'] = String(cssStylesObj.backgroundPosition);
        delete cssStylesObj.backgroundPosition;
      }
      if (cssStylesObj.backgroundRepeat && cssStylesObj.backgroundRepeat !== 'no-repeat') {
        cssVariablesObj['--ha-background-repeat'] = String(cssStylesObj.backgroundRepeat);
        delete cssStylesObj.backgroundRepeat;
      }
      if (cssStylesObj.backgroundAttachment && cssStylesObj.backgroundAttachment !== 'scroll') {
        cssVariablesObj['--ha-background-attachment'] = String(cssStylesObj.backgroundAttachment);
        delete cssStylesObj.backgroundAttachment;
      }
    }
  }

  // Generate layout CSS - use direct values (no CSS variables) - dont generate these for the root component
  if (appearance?.sizeAndSpacing && type !== 'root') {
    const sizeAndSpacing = appearance.sizeAndSpacing;

    // Generate CSS rules with direct values
    if (sizeAndSpacing.width && sizeAndSpacing.width !== 'auto') {
      cssStylesObj.width = sizeAndSpacing.width;
    }
    if (sizeAndSpacing.height && sizeAndSpacing.height !== 'auto') {
      cssStylesObj.height = sizeAndSpacing.height;
    }
    if (sizeAndSpacing.padding) {
      cssStylesObj.padding = sizeAndSpacing.padding;
    }
    if (sizeAndSpacing.margin) {
      cssStylesObj.margin = sizeAndSpacing.margin;
    }
  }

  // Generate typography CSS (only for root, or component when override is true)
  // Use direct values (no CSS variables), except for root which needs CSS variables for global styles
  if (appearance?.typography) {
    const typography = appearance.typography;
    const shouldGenerateTypography = type === 'root' || typography.override === true;

    if (shouldGenerateTypography) {
      if (type === 'root') {
        // Root: generate CSS variables for global typography
        if (typography.fontFamily) {
          cssVariablesObj['--ha-typography-font-family'] = fontFamilyMap[typography.fontFamily];
        }
        if (typography.headingWeight) {
          cssVariablesObj['--ha-typography-heading-weight'] = String(typography.headingWeight);
        }
        if (typography.bodyWeight) {
          cssVariablesObj['--ha-typography-body-weight'] = String(typography.bodyWeight);
        }
        if (typography.baseFontSize) {
          cssVariablesObj['--ha-typography-base-font-size'] = typography.baseFontSize;
        }
        if (typography.lineHeight) {
          cssVariablesObj['--ha-typography-line-height'] = String(typography.lineHeight);
        }
        if (typography.letterSpacing !== undefined) {
          cssVariablesObj['--ha-typography-letter-spacing'] = `${typography.letterSpacing}px`;
        }
      } else {
        // Component: generate inline styles with direct values
        if (typography.fontFamily) {
          cssStylesObj.fontFamily = fontFamilyMap[typography.fontFamily];
        }
        if (typography.useAdvancedTypography) {
          if (typography.headingWeight) {
            cssStylesObj.fontWeight = typography.headingWeight;
          }
          if (typography.baseFontSize) {
            cssStylesObj.fontSize = typography.baseFontSize;
          }
          if (typography.lineHeight) {
            cssStylesObj.lineHeight = typography.lineHeight;
          }
          if (typography.letterSpacing !== undefined) {
            cssStylesObj.letterSpacing = `${typography.letterSpacing}px`;
          }
        }
      }
    }
  }

  return {
    cssVariables: Object.keys(cssVariablesObj).length > 0 ? cssVariablesObj : undefined,
    cssStyles: Object.keys(cssStylesObj).length > 0 ? cssStylesObj : undefined,
  };
}
