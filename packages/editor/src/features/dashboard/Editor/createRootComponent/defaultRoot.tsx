import React, { CSSProperties } from 'react';
import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { UnitFieldValue } from '@typings/fields';
import { generateColorSwatches } from '@helpers/color';
import { generateCssVariables } from '@helpers/color/generateCssVariables';

const defaultBackground = new URL('./default-background.jpg', import.meta.url).href;
interface BackgroundProps {
  /** whether to use a background image or not @default true */
  useBackgroundImage: boolean;
  /** the background image to apply to the dashboard @default defaultBackground */
  backgroundImage?: string;
  /** overlay color drawn over the image (supports gradients/alpha) */
  overlayColor?: string;
  /** overlay blend mode to tint/merge overlay over the image @default "multiply" */
  overlayBlendMode?: CSSProperties['mixBlendMode'];
  /** the blur amount to apply to the background image of the dashboard @default 15 */
  blur?: number;
  /** the opacity of the background overlay color @default 0.9 */
  overlayOpacity?: number;
  /** CSS background-size value or 'custom' to use backgroundSizeCustom */
  backgroundSize?: string;
  /** custom CSS background-size when backgroundSize is 'custom' */
  backgroundSizeCustom?: string;
  /** CSS background-position, e.g. 'center center' */
  backgroundPosition?: string;
  /** CSS background-repeat */
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'space' | 'round';
  /** CSS background-attachment */
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  /** Optional image filters */
  useAdvancedFilters?: boolean;
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturate?: number;
  filterGrayscale?: number;
  /** Optional radial glow overlay controls - removed */
}

interface TypographyProps {
  /** Font family selection */
  fontFamily: string;
  /** Advanced typography options */
  useAdvancedTypography?: boolean;
  /** Font weight for headings */
  headingWeight: number;
  /** Font weight for body text */
  bodyWeight: number;
  /** Base font size */
  baseFontSize: UnitFieldValue;
  /** Line height */
  lineHeight: number;
  /** Letter spacing */
  letterSpacing: number;
}

export type DefaultRootProps = {
  background: BackgroundProps;
  typography: TypographyProps;
};
// TODO - Combine to shared constant
// Map font family names to Google Fonts API format
const googleFontsNameMap: Record<string, string> = {
  roboto: 'Roboto',
  'open-sans': 'Open+Sans',
  lato: 'Lato',
  montserrat: 'Montserrat',
  'source-sans-pro': 'Source+Sans+Pro',
  poppins: 'Poppins',
  nunito: 'Nunito',
  inter: 'Inter',
  'playfair-display': 'Playfair+Display',
  merriweather: 'Merriweather',
};

// Font family mapping
const fontFamilyMap: Record<string, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  roboto: '"Roboto", system-ui, sans-serif',
  'open-sans': '"Open Sans", system-ui, sans-serif',
  lato: '"Lato", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  'source-sans-pro': '"Source Sans Pro", system-ui, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
  nunito: '"Nunito", system-ui, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  'playfair-display': '"Playfair Display", system-ui, serif',
  merriweather: '"Merriweather", system-ui, serif',
};

export const defaultRootConfig: CustomComponentConfig<DefaultRootProps> = {
  label: 'Default Root',
  rootConfiguration: true,
  fields: {
    background: {
      type: 'object',
      collapseOptions: {
        startExpanded: true,
      },
      label: 'Background options',
      description: 'General options for the main background',
      objectFields: {
        useBackgroundImage: {
          type: 'switch',
          label: 'Use Background Image',
          description: 'Whether to use a background image or not',
          default: true,
        },
        backgroundImage: {
          type: 'imageUpload',
          label: 'Background Image',
          description: 'The entity to display in the button card',
          default: undefined,
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        backgroundSize: {
          type: 'select',
          label: 'Background Size',
          description: 'CSS background-size value',
          default: 'cover',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: 'Auto', value: 'auto' },
            { label: 'Custom…', value: 'custom' },
          ],
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        backgroundSizeCustom: {
          type: 'text',
          label: 'Custom Background Size',
          description: 'Any valid CSS background-size value',
          default: '',
          visible(data) {
            return (data.background?.backgroundSize ?? 'cover') === 'custom' && (data.background?.useBackgroundImage ?? true);
          },
        },
        backgroundPosition: {
          type: 'text',
          label: 'Background Position',
          description: 'CSS background-position (e.g., "center center", "top", "50% 50%")',
          default: 'center center',
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        backgroundRepeat: {
          type: 'select',
          label: 'Background Repeat',
          description: 'CSS background-repeat',
          default: 'no-repeat',
          options: [
            { label: 'No Repeat', value: 'no-repeat' },
            { label: 'Repeat', value: 'repeat' },
            { label: 'Repeat X', value: 'repeat-x' },
            { label: 'Repeat Y', value: 'repeat-y' },
            { label: 'Space', value: 'space' },
            { label: 'Round', value: 'round' },
          ],
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        overlayColor: {
          type: 'color',
          label: 'Overlay Color',
          description: 'Background color or gradient. If an image is enabled, this tints the image; otherwise it becomes the background.',
          default: '#4254c5',
        },
        overlayBlendMode: {
          type: 'select',
          label: 'Overlay Blend Mode',
          description: 'How the overlay color blends with the image',
          default: 'multiply',
          options: [
            { label: 'Color', value: 'color' },
            { label: 'Color Burn', value: 'color-burn' },
            { label: 'Color Dodge', value: 'color-dodge' },
            { label: 'Darken', value: 'darken' },
            { label: 'Difference', value: 'difference' },
            { label: 'Exclusion', value: 'exclusion' },
            { label: 'Hard Light', value: 'hard-light' },
            { label: 'Hue', value: 'hue' },
            { label: 'Lighten', value: 'lighten' },
            { label: 'Luminosity', value: 'luminosity' },
            { label: 'Multiply', value: 'multiply' },
            { label: 'Normal', value: 'normal' },
            { label: 'Overlay', value: 'overlay' },
            { label: 'Saturation', value: 'saturation' },
            { label: 'Screen', value: 'screen' },
            { label: 'Soft Light', value: 'soft-light' },
          ],
        },
        blur: {
          type: 'number',
          label: 'Blur',
          min: 0,
          description: 'Blur amount applied to the background image',
          default: 25,
        },
        overlayOpacity: {
          type: 'number',
          label: 'Overlay Opacity',
          description: 'Opacity applied to the overlay color',
          default: 0.9,
          min: 0,
          max: 1,
          step: 0.1,
        },
        useAdvancedFilters: {
          type: 'switch',
          label: 'Use Advanced Filters',
          description: 'Enable image filters like brightness, contrast, saturation and grayscale',
          default: false,
        },
        filterBrightness: {
          type: 'number',
          label: 'Brightness',
          description: 'CSS filter brightness()',
          default: 1,
          min: 0,
          max: 3,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
        filterContrast: {
          type: 'number',
          label: 'Contrast',
          description: 'CSS filter contrast()',
          default: 1,
          min: 0,
          max: 3,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
        filterSaturate: {
          type: 'number',
          label: 'Saturate',
          description: 'CSS filter saturate()',
          default: 1,
          min: 0,
          max: 3,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
        filterGrayscale: {
          type: 'number',
          label: 'Grayscale',
          description: 'CSS filter grayscale()',
          default: 0,
          min: 0,
          max: 1,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
      },
    },
    typography: {
      type: 'object',
      collapseOptions: {
        startExpanded: true,
      },
      label: 'Typography',
      description: 'Font and text styling options',
      objectFields: {
        fontFamily: {
          type: 'select',
          label: 'Font Family',
          description: 'Choose a font family for your dashboard',
          default: 'roboto',
          options: [
            { label: 'System Font', value: 'system' },
            { label: 'Roboto', value: 'roboto' },
            { label: 'Open Sans', value: 'open-sans' },
            { label: 'Lato', value: 'lato' },
            { label: 'Montserrat', value: 'montserrat' },
            { label: 'Source Sans Pro', value: 'source-sans-pro' },
            { label: 'Poppins', value: 'poppins' },
            { label: 'Nunito', value: 'nunito' },
            { label: 'Inter', value: 'inter' },
            { label: 'Playfair Display', value: 'playfair-display' },
            { label: 'Merriweather', value: 'merriweather' },
          ],
        },
        useAdvancedTypography: {
          type: 'switch',
          label: 'Advanced Typography',
          description: 'Enable advanced typography options',
          default: false,
        },
        headingWeight: {
          type: 'select',
          label: 'Heading Weight',
          description: 'Font weight for headings and titles',
          default: 600,
          options: [
            { label: 'Light (300)', value: 300 },
            { label: 'Regular (400)', value: 400 },
            { label: 'Medium (500)', value: 500 },
            { label: 'Semi Bold (600)', value: 600 },
            { label: 'Bold (700)', value: 700 },
          ],
          visible(data) {
            return data.typography?.useAdvancedTypography ?? false;
          },
        },
        bodyWeight: {
          type: 'select',
          label: 'Body Weight',
          description: 'Font weight for body text',
          default: 400,
          options: [
            { label: 'Light (300)', value: 300 },
            { label: 'Regular (400)', value: 400 },
            { label: 'Medium (500)', value: 500 },
            { label: 'Semi Bold (600)', value: 600 },
          ],
          visible(data) {
            return data.typography?.useAdvancedTypography ?? false;
          },
        },
        baseFontSize: {
          type: 'unit',
          label: 'Base Font Size',
          description: 'Base font size to apply to the dashboard',
          default: '16px',
          min: 12,
          max: 24,
          step: 1,
          visible(data) {
            return data.typography?.useAdvancedTypography ?? false;
          },
        },
        lineHeight: {
          type: 'number',
          label: 'Line Height',
          description: 'Line height multiplier',
          default: 1.5,
          min: 1.2,
          max: 2.0,
          step: 0.1,
          visible(data) {
            return data.typography?.useAdvancedTypography ?? false;
          },
        },
        letterSpacing: {
          type: 'number',
          label: 'Letter Spacing',
          description: 'Letter spacing in pixels',
          default: 0,
          min: -1,
          max: 2,
          step: 0.1,
          visible(data) {
            return data.typography?.useAdvancedTypography ?? false;
          },
        },
      },
    },
  },
  styles(props) {
    const { background, typography } = props;
    const bgSize =
      background?.backgroundSize === 'custom' ? (background?.backgroundSizeCustom ?? 'cover') : (background?.backgroundSize ?? 'cover');
    const bgImageUrl = background?.useBackgroundImage
      ? `url(${background?.backgroundImage ? background.backgroundImage : defaultBackground})`
      : '';

    const selectedFontFamily = typography?.fontFamily ?? 'roboto';
    const fontFamily = fontFamilyMap[selectedFontFamily] ?? fontFamilyMap.system;
    const swatches = generateColorSwatches(props.design.theme);
    const cssVariables = generateCssVariables(swatches);

    return `
      :root {
        ${cssVariables}
        /* Background Variables */
        --background-image: ${bgImageUrl};
        --background-size: ${bgSize};
        --background-position: ${background?.backgroundPosition ?? 'center center'};
        --background-repeat: ${background?.backgroundRepeat ?? 'no-repeat'};
        --background-overlay-color: ${background?.overlayColor ?? 'var(--clr-primary-a0'};
        --background-overlay-blend-mode: ${background?.overlayBlendMode ?? 'multiply'};
        --background-overlay-opacity: ${background?.overlayOpacity ?? 0.9};
        --background-blur: ${background?.blur ?? 25}px;
        --background-filter-brightness: ${background?.filterBrightness ?? 1};
        --background-filter-contrast: ${background?.filterContrast ?? 1};
        --background-filter-saturate: ${background?.filterSaturate ?? 1};
        --background-filter-grayscale: ${background?.filterGrayscale ?? 0};
        
        /* Typography Variables */
        --typography-font-family: ${fontFamily};
        --typography-heading-weight: ${typography?.headingWeight ?? 600};
        --typography-body-weight: ${typography?.bodyWeight ?? 400};
        --typography-base-font-size: ${typography?.baseFontSize ?? 16}px;
        --typography-line-height: ${typography?.lineHeight ?? 1.5};
        --typography-letter-spacing: ${typography?.letterSpacing ?? 0}px;
      }
      
      /* Root Component Styles */
      .root-component {
        position: absolute !important;
        inset: 0;
        z-index: -1;
        pointer-events: none;
      }
      
      .root-component-background {
        width: 100%;
        height: 100%;
        background-position: var(--background-position, center center);
        background-repeat: var(--background-repeat, no-repeat);
        background-size: var(--background-size, cover);
        background-image: var(--background-image);
        filter:
          blur(var(--background-blur))
          brightness(var(--background-filter-brightness, 1))
          contrast(var(--background-filter-contrast, 1))
          saturate(var(--background-filter-saturate, 1))
          grayscale(var(--background-filter-grayscale, 0));
        overflow: hidden;
      }
      
      .root-component-background:after { 
        content: none; 
      }
      
      .root-component-background:before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--background-overlay-color, transparent);
        opacity: var(--background-overlay-opacity, 0);
        mix-blend-mode: var(--background-overlay-blend-mode, normal);
      }

      /* ============================================
         CSS Reset & Normalization
         ============================================ */
      
      /* Box-sizing reset - makes width/height calculations intuitive */
      *, *::before, *::after {
        box-sizing: border-box;
      }

      /* Remove default margins on common elements */
      html, body, h1, h2, h3, h4, h5, h6, p, blockquote, pre,
      dl, dd, ol, ul, figure, hr, fieldset, legend {
        margin: 0;
        padding: 0;
      }

      html {
        
        /* Better font rendering on macOS/iOS */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        
        /* Prevent iOS text size adjust after orientation change */
        -webkit-text-size-adjust: 100%;
        
        /* Enable smooth scrolling for anchor links */
        scroll-behavior: smooth;
      }
      
      /* Global Typography Styles */
      body {
        font-family: var(--typography-font-family);
        font-size: var(--typography-base-font-size);
        line-height: var(--typography-line-height);
        letter-spacing: var(--typography-letter-spacing);
        
        /* Better text rendering */
        text-rendering: optimizeLegibility;
        
        /* Minimum height for full viewport coverage */
        min-height: 100vh;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--typography-font-family);
        font-weight: var(--typography-heading-weight);
        
        /* Better line-height for headings */
        line-height: 1.2;
        
        /* Prevent orphans in headings */
        text-wrap: balance;
      }
      
      p, span, div, a, button, input, textarea, select {
        font-family: var(--typography-font-family);
        font-weight: var(--typography-body-weight);
      }

      /* Better paragraph spacing */
      p {
        line-height: var(--typography-line-height);
      }

      /* Remove list styles by default (opt-in styling is more flexible) */
      ul, ol {
        list-style: none;
      }

      /* Better link defaults */
      a {
        text-decoration: none;
        color: inherit;
      }

      /* Make images easier to work with */
      img, picture, video, canvas, svg {
        display: block;
        max-width: 100%;
      }

      /* Remove built-in form element styling */
      input, button, textarea, select {
        background-color: transparent;
        border: none;
        outline: none;
      }

      /* Better focus styles for accessibility */
      :focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }

      /* Remove spinners from number inputs */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        appearance: textfield;
        -moz-appearance: textfield;
      }

      /* Remove search input decorations */
      input[type="search"]::-webkit-search-decoration,
      input[type="search"]::-webkit-search-cancel-button,
      input[type="search"]::-webkit-search-results-button,
      input[type="search"]::-webkit-search-results-decoration {
        -webkit-appearance: none;
      }

      /* Better table defaults */
      table {
        border-collapse: collapse;
        border-spacing: 0;
      }

      /* Improve consistency of monospace fonts */
      pre, code, kbd, samp {
        font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
        font-size: 1em;
      }

      /* Prevent text overflow */
      h1, h2, h3, h4, h5, h6, p {
        overflow-wrap: break-word;
      }

      /* Better hr element */
      hr {
        height: 0;
        border: 0;
        border-top: 1px solid currentColor;
        opacity: 0.25;
      }

      /* Improve media defaults */
      img, svg, video {
        height: auto;
      }

      /* Remove animations for users who prefer reduced motion */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
  },
  render: Render,
};

function Render(props: RenderProps<DefaultRootProps>) {
  const { typography } = props;

  // Generate Google Fonts link for non-system fonts
  const selectedFontFamily = typography?.fontFamily ?? 'roboto';

  const googleFontsUrl =
    selectedFontFamily !== 'system'
      ? (() => {
          const headingWeight = typography?.headingWeight ?? 600;
          const bodyWeight = typography?.bodyWeight ?? 400;
          // Sort weights in ascending order as required by Google Fonts API
          const sortedWeights = [headingWeight, bodyWeight].sort((a, b) => a - b);
          const uniqueWeights = [...new Set(sortedWeights)]; // Remove duplicates
          const weightsString = uniqueWeights.join(';');
          return `https://fonts.googleapis.com/css2?family=${googleFontsNameMap[selectedFontFamily]}:wght@${weightsString}&display=swap`;
        })()
      : '';

  // Clean up any existing Google Fonts links when font changes
  React.useEffect(() => {
    if (typeof document !== 'undefined' && selectedFontFamily) {
      // Remove any existing href where it has href= family=(not the current family)
      const existingLinks = document.querySelectorAll(
        `link[href*="fonts.googleapis.com"]:not([href*="${googleFontsNameMap[selectedFontFamily]}"])[rel="stylesheet"]`
      );
      existingLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    }
  }, [selectedFontFamily]);

  return (
    <>
      {/* 
        Note: Font links are rendered in component body rather than <head>.
        This is acceptable because:
        1. Modern browsers handle font loading asynchronously regardless of placement
        2. React's rendering and Puck's architecture manage document structure
        3. Font loading timing isn't critical for this use case
        4. We clean up previous fonts via useEffect to prevent accumulation
      */}
      {googleFontsUrl && (
        <>
          <link href={googleFontsUrl} rel='stylesheet' />
        </>
      )}
      <div
        style={{
          width: '200px',
          height: '200px',
          backgroundColor: 'var(--clr-primary-a10)',
        }}
      ></div>
      <div className='root-component' id={props.id}>
        <div className='root-component-background'></div>
      </div>
    </>
  );
}
