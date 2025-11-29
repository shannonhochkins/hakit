import { generateColorSwatches } from '@helpers/color';
import { generateCssVariables } from '@helpers/color/generateCssVariables';
import { InternalComponentFields, InternalRootComponentFields } from '@typings/fields';
import { fontFamilyMap } from '@features/dashboard/Editor/Typography';

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
  if (appearance?.background) {
    const bg = appearance.background;

    // Generate CSS rules with direct values
    if (bg.color) {
      cssStylesObj.backgroundColor = bg.color;
    }

    if (bg.useImage && bg.image) {
      cssStylesObj.backgroundImage = `url(${bg.image})`;

      if (bg.size) {
        const bgSize = bg.size === 'custom' ? (bg.sizeCustom ?? 'cover') : bg.size;
        cssStylesObj.backgroundSize = bgSize;
      }

      if (bg.position) {
        cssStylesObj.backgroundPosition = bg.position;
      }

      if (bg.repeat) {
        cssStylesObj.backgroundRepeat = bg.repeat;
      }

      if (bg.attachment) {
        cssStylesObj.backgroundAttachment = bg.attachment;
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
      if (cssStylesObj.backgroundSize) {
        cssVariablesObj['--ha-background-size'] = String(cssStylesObj.backgroundSize);
        delete cssStylesObj.backgroundSize;
      }
      if (cssStylesObj.backgroundPosition) {
        cssVariablesObj['--ha-background-position'] = String(cssStylesObj.backgroundPosition);
        delete cssStylesObj.backgroundPosition;
      }
      if (cssStylesObj.backgroundRepeat) {
        cssVariablesObj['--ha-background-repeat'] = String(cssStylesObj.backgroundRepeat);
        delete cssStylesObj.backgroundRepeat;
      }
      if (cssStylesObj.backgroundAttachment) {
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
