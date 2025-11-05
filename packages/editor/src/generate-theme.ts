import { generateColorSwatches } from '@helpers/color';
import { generateCssVariablesData, generateCssVariables } from '@helpers/color/generateCssVariables';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const PRIMARY_COLOR = `#0B164D`;
const ERROR_COLOR = `#ED0707`;
const SUCCESS_COLOR = `#22946E`;
const WARNING_COLOR = `#A87A2A`;
const INFO_COLOR = `#21498A`;
const SURFACE_COLOR = `#0F0D16`;

// maps to pucks rose color
const primarySwatches = generateColorSwatches({
  primary: PRIMARY_COLOR,
});
// maps to pucks red color
const errorSwatches = generateColorSwatches({
  primary: ERROR_COLOR,
});
// maps to pucks green color
const successSwatches = generateColorSwatches({
  primary: SUCCESS_COLOR,
});
// maps to pucks yellow color
const warningSwatches = generateColorSwatches({
  primary: WARNING_COLOR,
});
// maps to pucks azure color
const infoSwatches = generateColorSwatches({
  primary: INFO_COLOR,
});
// maps to pucks grey color
const surfaceSwatches = generateColorSwatches({
  surface: SURFACE_COLOR,
  tonalityMix: 0,
  surfaceOpts: {
    lightModeDarkenSpan: 0,
    darkModeLightenSpan: 0,
  },
});

// Helper to build puck color variables from swatches
// Puck expects 12 steps (01..12) lightest->darkest; we have darkest->lightest in swatches.
// We expose 10 distinct steps, duplicating the darkest for 10/11/12.
const buildPuckVars = (scaleName: string, name: string, swatches: ReturnType<typeof generateColorSwatches>['primary'], key?: string) => {
  if (!swatches || !swatches.length) return '';
  const data = generateCssVariablesData({ [key || 'primary']: swatches });
  const entries = data[key as keyof typeof data] || data.primary || [];
  // Reverse so index 0 becomes lightest
  const reversed = [...entries].reverse();
  // Take first 10 (lightest to darkest) then duplicate last for 11/12
  const ten = reversed.slice(0, 10);
  const extended = ten.concat(ten.slice(-1), ten.slice(-1));
  return extended
    .map((item, i) => {
      const step = String(i + 1).padStart(2, '0'); // 01..12
      // Map puck var to our underlying variable reference.
      // item.background/text contain names without leading --
      const bgRef = `var(--${item.prefix ? item.prefix + '-' : ''}${name}-${item.label})`;
      const lines = [`--puck-color-${scaleName}-${step}: ${bgRef};`];
      return lines.join('\n');
    })
    .join('\n');
};

const ourVariables = [
  generateCssVariables(errorSwatches, {
    primaryName: 'error',
  }),
  generateCssVariables(primarySwatches, {
    primaryName: 'primary',
  }),
  generateCssVariables(successSwatches, {
    primaryName: 'success',
  }),
  generateCssVariables(warningSwatches, {
    primaryName: 'warning',
  }),
  generateCssVariables(infoSwatches, {
    primaryName: 'info',
  }),
  generateCssVariables(surfaceSwatches, {
    primaryName: 'surface',
  }),
];

const puckVariables = [
  buildPuckVars('rose', 'primary', primarySwatches.primary),
  buildPuckVars('red', 'error', errorSwatches.primary),
  buildPuckVars('green', 'success', successSwatches.primary),
  buildPuckVars('yellow', 'warning', warningSwatches.primary),
  buildPuckVars('azure', 'info', infoSwatches.primary),
  buildPuckVars('grey', 'surface', surfaceSwatches.surface, 'surface'),
]
  .filter(Boolean)
  .join('\n');

const cssVariables = `
  :root {
    /* AUTOMATED - regenerate using \`bun run generate-theme\` in the root of the repo */
    /* Base generated variables */
    ${ourVariables.join('\n')}
    /* Puck mapped color variables */
    ${puckVariables}
  /* === SHADOWS (surface-based, composite color-mix for subtle darkening) === */
  --shadow-sm: 0 1px 2px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-surface-a0) 100%, black 25%) 100%, transparent 92%);
  --shadow-md: 0 4px 6px -1px color-mix(in srgb, color-mix(in srgb, var(--clr-surface-a0) 100%, black 30%) 100%, transparent 88%);
  --shadow-lg: 0 10px 15px -3px color-mix(in srgb, color-mix(in srgb, var(--clr-surface-a0) 100%, black 35%) 100%, transparent 84%);
  --shadow-xl: 0 20px 25px -5px color-mix(in srgb, color-mix(in srgb, var(--clr-surface-a0) 100%, black 40%) 100%, transparent 80%);
  --shadow-2xl: 0 25px 50px -12px color-mix(in srgb, color-mix(in srgb, var(--clr-surface-a0) 100%, black 45%) 100%, transparent 70%);

  /* Primary Button Shadows (composite darken + transparency) */
  --shadow-primary-base: 0 1px 7px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-primary-a40) 100%, black 20%) 100%, transparent 80%);
  --shadow-primary-hover: 0 2px 10px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-primary-a40) 100%, black 25%) 100%, transparent 75%);
  --shadow-primary-active: 0 2px 4px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-primary-a50) 100%, black 30%) 100%, transparent 70%);
  --shadow-primary-focus: 0 0 0 3px color-mix(in srgb, color-mix(in srgb, var(--clr-primary-a30) 100%, black 35%) 100%, transparent 60%);
  --shadow-primary-focus-sm: 0 0 0 2px color-mix(in srgb, color-mix(in srgb, var(--clr-primary-a30) 100%, black 25%) 100%, transparent 70%);

  /* Error Button Shadows (composite darken + transparency) */
  --shadow-error-base: 0 1px 7px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-error-a40) 100%, black 20%) 100%, transparent 80%);
  --shadow-error-hover: 0 2px 10px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-error-a40) 100%, black 25%) 100%, transparent 75%);
  --shadow-error-active: 0 2px 4px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-error-a50) 100%, black 30%) 100%, transparent 70%);
  --shadow-error-focus: 0 0 0 3px color-mix(in srgb, color-mix(in srgb, var(--clr-error-a30) 100%, black 35%) 100%, transparent 60%);
  --shadow-error-focus-sm: 0 0 0 2px color-mix(in srgb, color-mix(in srgb, var(--clr-error-a30) 100%, black 25%) 100%, transparent 70%);

  /* Success Button Shadows (composite darken + transparency) */
  --shadow-success-base: 0 1px 7px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-success-a40) 100%, black 20%) 100%, transparent 80%);
  --shadow-success-hover: 0 2px 10px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-success-a40) 100%, black 25%) 100%, transparent 75%);
  --shadow-success-active: 0 2px 4px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-success-a50) 100%, black 30%) 100%, transparent 70%);
  --shadow-success-focus: 0 0 0 3px color-mix(in srgb, color-mix(in srgb, var(--clr-success-a30) 100%, black 35%) 100%, transparent 60%);
  --shadow-success-focus-sm: 0 0 0 2px color-mix(in srgb, color-mix(in srgb, var(--clr-success-a30) 100%, black 25%) 100%, transparent 70%);

    /* === TYPOGRAPHY === */
    --font-family: 'Roboto', sans-serif;
    /* Font Sizes */
    --font-size-xs: 0.75rem; /* 12px */
    --font-size-sm: 0.875rem; /* 14px */
    --font-size-base: 1rem; /* 16px */
    --font-size-lg: 1.125rem; /* 18px */
    --font-size-xl: 1.25rem; /* 20px */
    --font-size-2xl: 1.5rem; /* 24px */
    --font-size-3xl: 1.875rem; /* 30px */
    --font-size-4xl: 2.25rem; /* 36px */
    --font-size-5xl: 3rem; /* 48px */
    --font-size-6xl: 3.75rem; /* 60px */

    /* Font Weights */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Line Heights */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;

    /* === SPACING === */
    --space-0: 0;
    --space-1: 0.25rem; /* 4px */
    --space-2: 0.5rem; /* 8px */
    --space-3: 0.75rem; /* 12px */
    --space-4: 1rem; /* 16px */
    --space-5: 1.25rem; /* 20px */
    --space-6: 1.5rem; /* 24px */
    --space-8: 2rem; /* 32px */
    --space-10: 2.5rem; /* 40px */
    --space-12: 3rem; /* 48px */
    --space-16: 4rem; /* 64px */
    --space-20: 5rem; /* 80px */
    --space-24: 6rem; /* 96px */
    --space-32: 8rem; /* 128px */

    /* === BORDER RADIUS === */
    --radius-sm: 0.25rem; /* 4px */
    --radius-md: 0.375rem; /* 6px */
    --radius-lg: 0.5rem; /* 8px */
    --radius-xl: 0.75rem; /* 12px */
    --radius-2xl: 1rem; /* 16px */
    --radius-full: 9999px;

    /* === EFFECTS === */
    --blur-sm: 4px;
    --blur-md: 8px;
    --blur-lg: 16px;
    --blur-xl: 24px;
    --blur-2xl: 40px;
    --blur-3xl: 64px;

    /* === TRANSITIONS === */
    --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    /* === Z-INDEX === */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;

    --header-height: var(--space-16);
    /** Puck overrides **/
    --puck-space-px: var(--space-4);
    --puck-color-black: color-mix(in srgb, var(--clr-on-primary-a90) 0%, white 100%);
    --puck-color-white: var(--clr-on-primary-a90);

    /* === TYPOGRAPHY MAPPINGS === */
    /* Map Puck font sizes to design system */
    --puck-font-size-scale-base-unitless: 12;
    --puck-font-size-xxxs-unitless: 12;
    --puck-font-size-xxs-unitless: 14;
    --puck-font-size-xs-unitless: 16;
    --puck-font-size-s-unitless: 18;
    --puck-font-size-m-unitless: 20;
    --puck-font-size-l-unitless: 24;
    --puck-font-size-xl-unitless: 30;
    --puck-font-size-xxl-unitless: 36;
    --puck-font-size-xxxl-unitless: 48;
    --puck-font-size-xxxxl-unitless: 60;

    /* Map Puck descriptive font sizes to design system */
    --puck-font-size-xxxs: var(--font-size-xs);    /* 12px */
    --puck-font-size-xxs: var(--font-size-sm);     /* 14px */
    --puck-font-size-xs: var(--font-size-base);    /* 16px */
    --puck-font-size-s: var(--font-size-lg);       /* 18px */
    --puck-font-size-m: var(--font-size-xl);       /* 20px */
    --puck-font-size-l: var(--font-size-2xl);      /* 24px */
    --puck-font-size-xl: var(--font-size-3xl);     /* 30px */
    --puck-font-size-xxl: var(--font-size-4xl);    /* 36px */
    --puck-font-size-xxxl: var(--font-size-5xl);   /* 48px */
    --puck-font-size-xxxxl: var(--font-size-6xl);  /* 60px */

    /* Map Puck functional font sizes */
    --puck-font-size-base: var(--font-size-base);
    /* Map Puck line heights to design system */
    --line-height-reset: 1;
    --line-height-xs: var(--line-height-tight);
    --line-height-s: var(--line-height-tight);
    --line-height-m: var(--line-height-normal);
    --line-height-l: var(--line-height-normal);
    --line-height-xl: var(--line-height-relaxed);

    /* Map Puck functional line heights */
    --line-height-base: var(--line-height-normal);

    /* Map Puck font families to design system */
    --fallback-font-stack: var(--font-family);
    --puck-font-family: var(--font-family);
    --puck-font-family-monospaced: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace;
    
    /* Map Puck spacing to design system */
    --space-m-unitless: 24;
  }
`;

// now, write the css file to theme.css in the same location

// --- Write the file using Bun.write ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, 'theme.css');

// Bun.write automatically creates or overwrites the file
await Bun.write(outputPath, cssVariables);

console.log(`✅ theme.css written to ${outputPath}`);

/**
 * Map puck colors
 * Seeing as puck generates a css variable list like this:
 * We map our generated color swatches to these variables.
 * Notice the duplicated colors toward the end, this is intentional as we 
 * limit the colors we're displaying on the website & application to 10 steps.
 * 
  --puck-color-rose-01: var(--clr-primary-a90); // lightest
  --puck-color-rose-02: var(--clr-primary-a80);
  --puck-color-rose-03: var(--clr-primary-a70);
  --puck-color-rose-04: var(--clr-primary-a60);
  --puck-color-rose-05: var(--clr-primary-a50);
  --puck-color-rose-06: var(--clr-primary-a40);
  --puck-color-rose-07: var(--clr-primary-a30);
  --puck-color-rose-08: var(--clr-primary-a20);
  --puck-color-rose-09: var(--clr-primary-a10);
  --puck-color-rose-10: var(--clr-primary-a00);
  --puck-color-rose-11: var(--clr-primary-a00);
  --puck-color-rose-12: var(--clr-primary-a00);  // darkest
 */
