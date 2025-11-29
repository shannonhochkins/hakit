// import React, { CSSProperties } from 'react';
import { CustomRootComponentConfig, RenderProps } from '@typings/puck';
// import { UnitFieldValue } from '@typings/fields';
import { properties, sharedCss } from '../../../../css-variables';
import { DefaultComponentProps } from '@measured/puck';
import { Typography } from '../Typography';
// import { processPropsWithInternalFields } from '../createPuckComponent';

const defaultBackground = new URL('./default-background.jpg', import.meta.url).href;
export interface InternalFieldsBackgroundProps {
  $appearance: {
    background: {
      /** overlay color drawn over the image (supports gradients/alpha) */
      overlayColor: string;
      /** the opacity of the background overlay color @default 0.9 */
      overlayOpacity: number;
      /** blend mode for the background image and color */
      blendMode:
        | 'normal'
        | 'multiply'
        | 'screen'
        | 'overlay'
        | 'darken'
        | 'lighten'
        | 'color-dodge'
        | 'color-burn'
        | 'hard-light'
        | 'soft-light'
        | 'difference'
        | 'exclusion'
        | 'hue'
        | 'saturation'
        | 'color'
        | 'luminosity';
      /** Optional image filters */
      useAdvancedFilters: boolean;
      filterBlur: number;
      filterBrightness: number;
      filterContrast: number;
      filterSaturate: number;
      filterGrayscale: number;
    };
  };
}

export const defaultRootConfig: CustomRootComponentConfig<DefaultComponentProps, InternalFieldsBackgroundProps> = {
  label: 'Default Root',
  rootConfiguration: true,
  fields: {},
  internalFields: {
    extend: {
      $appearance: {
        background: {
          overlayColor: {
            type: 'color',
            label: 'Overlay Color',
            description: 'Background color or gradient. If an image is enabled, this tints the image; otherwise it becomes the background.',
            default: 'var(--clr-primary-a10)',
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
          blendMode: {
            type: 'select',
            label: 'Image & Color Blend Mode',
            description:
              'Choose how the background image and color are blended together. Useful for overlay effects and creative backgrounds.',
            default: 'multiply',
            options: [
              { label: 'Normal', value: 'normal' },
              { label: 'Multiply', value: 'multiply' },
              { label: 'Screen', value: 'screen' },
              { label: 'Overlay', value: 'overlay' },
              { label: 'Darken', value: 'darken' },
              { label: 'Lighten', value: 'lighten' },
              { label: 'Color Dodge', value: 'color-dodge' },
              { label: 'Color Burn', value: 'color-burn' },
              { label: 'Hard Light', value: 'hard-light' },
              { label: 'Soft Light', value: 'soft-light' },
              { label: 'Difference', value: 'difference' },
              { label: 'Exclusion', value: 'exclusion' },
              { label: 'Hue', value: 'hue' },
              { label: 'Saturation', value: 'saturation' },
              { label: 'Color', value: 'color' },
              { label: 'Luminosity', value: 'luminosity' },
            ],
          },
          useAdvancedFilters: {
            type: 'switch',
            label: 'Enable Image Filters',
            description:
              'Turn on to adjust the background image with advanced filters like brightness, contrast, saturation, and grayscale.',
            default: false,
          },
          filterBlur: {
            type: 'number',
            label: 'Image Blur',
            min: 0,
            description: 'Apply a blur effect to the background, higher values create a stronger blur.',
            default: 25,
          },
          filterBrightness: {
            type: 'number',
            label: 'Image Brightness',
            description: 'Increase or decrease the brightness of the background image.',
            default: 1,
            min: 0,
            max: 3,
            step: 0.05,
            visible(data) {
              return data.$appearance?.background?.useAdvancedFilters || false;
            },
          },
          filterContrast: {
            type: 'number',
            label: 'Image Contrast',
            description: 'Adjust the contrast of the background image for more or less distinction.',
            default: 1,
            min: 0,
            max: 3,
            step: 0.05,
            visible(data) {
              return data.$appearance?.background?.useAdvancedFilters ?? false;
            },
          },
          filterSaturate: {
            type: 'number',
            label: 'Image Saturation',
            description: 'Change the intensity of colors in the background image.',
            default: 1,
            min: 0,
            max: 3,
            step: 0.05,
            visible(data) {
              return data.$appearance?.background?.useAdvancedFilters ?? false;
            },
          },
          filterGrayscale: {
            type: 'number',
            label: 'Image Grayscale',
            description: 'Convert the background image to grayscale (black & white).',
            default: 0,
            min: 0,
            max: 1,
            step: 0.05,
            visible(data) {
              return data.$appearance?.background?.useAdvancedFilters ?? false;
            },
          },
        },
      },
    },
    defaults: {
      $appearance: {
        background: {
          useImage: true,
          image: defaultBackground,
        },
      },
    },
  },
  styles(props) {
    // Note: CSS variables and internal styles are now generated by generateCssForInternalProps
    // This function only provides root-specific CSS structure and CSS reset
    // CSS variables are included via the helper in createRootComponent
    // Props parameter is required by type signature but values are generated by helper

    const filterParts: string[] = [];
    if (props.$appearance?.background?.filterBlur !== undefined) {
      filterParts.push(`blur(${props.$appearance?.background?.filterBlur}px)`);
    }
    if (props.$appearance?.background?.useAdvancedFilters) {
      if (props.$appearance?.background?.filterBrightness !== undefined) {
        filterParts.push(`brightness(${props.$appearance?.background?.filterBrightness})`);
      }
      if (props.$appearance?.background?.filterContrast !== undefined) {
        filterParts.push(`contrast(${props.$appearance?.background?.filterContrast})`);
      }
      if (props.$appearance?.background?.filterSaturate !== undefined) {
        filterParts.push(`saturate(${props.$appearance?.background?.filterSaturate})`);
      }
      if (props.$appearance?.background?.filterGrayscale !== undefined) {
        filterParts.push(`grayscale(${props.$appearance?.background?.filterGrayscale})`);
      }
    }

    return `
      ${properties}
      :root {
        ${sharedCss}
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
        background-color: var(--ha-background-color);
        background-position: var(--ha-background-position);
        background-repeat: var(--ha-background-repeat);
        background-size: var(--ha-background-size);
        background-image: var(--ha-background-image);
        background-attachment: var(--ha-background-attachment);
        filter: ${filterParts.join(' ')};
        overflow: hidden;
      }

      .root-component-background:after {
        content: none;
      }

      .root-component-background:before {
        content: '';
        position: absolute;
        inset: 0;
        background: ${props.$appearance?.background?.overlayColor || 'transparent'};
        opacity: ${props.$appearance?.background?.overlayOpacity || 0};
        mix-blend-mode: ${props.$appearance?.background?.blendMode || 'normal'};
      }

      /* ============================================
         CSS Reset & Normalization
         ============================================ */

      /* Box-sizing reset - makes width/height calculations intuitive */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      /* Remove default margins on common elements */
      html,
      body,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      blockquote,
      pre,
      dl,
      dd,
      ol,
      ul,
      figure,
      hr,
      fieldset,
      legend {
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
        font-family: var(--ha-typography-font-family);
        font-size: var(--ha-typography-base-font-size);
        line-height: var(--ha-typography-line-height);
        letter-spacing: var(--ha-typography-letter-spacing);

        /* Better text rendering */
        text-rendering: optimizeLegibility;

        /* Minimum height for full viewport coverage */
        min-height: 100vh;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-family: var(--ha-typography-font-family);
        font-weight: var(--ha-typography-heading-weight);

        /* Better line-height for headings */
        line-height: 1.2;

        /* Prevent orphans in headings */
        text-wrap: balance;
      }

      /* Better paragraph spacing */
      p {
        line-height: var(--ha-typography-line-height);
      }

      /* Remove list styles by default (opt-in styling is more flexible) */
      ul,
      ol {
        list-style: none;
      }

      /* Better link defaults */
      a {
        text-decoration: none;
        color: inherit;
      }

      /* Make images easier to work with */
      img,
      picture,
      video,
      canvas,
      svg {
        display: block;
        max-width: 100%;
      }

      /* Remove built-in form element styling */
      input,
      button,
      textarea,
      select {
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
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='number'] {
        appearance: textfield;
        -moz-appearance: textfield;
      }

      /* Remove search input decorations */
      input[type='search']::-webkit-search-decoration,
      input[type='search']::-webkit-search-cancel-button,
      input[type='search']::-webkit-search-results-button,
      input[type='search']::-webkit-search-results-decoration {
        -webkit-appearance: none;
      }

      /* Better table defaults */
      table {
        border-collapse: collapse;
        border-spacing: 0;
      }

      /* Improve consistency of monospace fonts */
      pre,
      code,
      kbd,
      samp {
        font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
        font-size: 1em;
      }

      /* Prevent text overflow */
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p {
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
      img,
      svg,
      video {
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

function Render(props: RenderProps<DefaultComponentProps>) {
  return (
    <>
      <Typography typography={props.$appearance?.typography} type='root' />
      <div className='root-component' id={props.id}>
        <div className='root-component-background'></div>
      </div>
    </>
  );
}
