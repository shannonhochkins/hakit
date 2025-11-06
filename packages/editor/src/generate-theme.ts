import { generateColorSwatches } from '@helpers/color';
import { generateCssVariablesData, generateCssVariables } from '@helpers/color/generateCssVariables';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sharedCss, properties } from './css-variables';

const lightMode = false;
const PRIMARY_COLOR = `#0630FF`;
const ERROR_COLOR = `#ED0707`;
const SUCCESS_COLOR = `#22946E`;
const WARNING_COLOR = `#A87A2A`;
const INFO_COLOR = `#21498A`;
const SURFACE_COLOR = !lightMode ? `#0F0D16` : `#FFFFFF`;

// maps to pucks rose color
const primarySwatches = generateColorSwatches({
  primary: PRIMARY_COLOR,
  lightMode,
});
// maps to pucks red color
const errorSwatches = generateColorSwatches({
  primary: ERROR_COLOR,
  lightMode,
});
// maps to pucks green color
const successSwatches = generateColorSwatches({
  primary: SUCCESS_COLOR,
  lightMode,
});
// maps to pucks yellow color
const warningSwatches = generateColorSwatches({
  primary: WARNING_COLOR,
  lightMode,
});
// maps to pucks azure color
const infoSwatches = generateColorSwatches({
  primary: INFO_COLOR,
  lightMode,
});
// maps to pucks grey color
const surfaceSwatches = generateColorSwatches({
  primary: PRIMARY_COLOR,
  surface: SURFACE_COLOR,
  tonalityMix: 0.1,
  surfaceOpts: {
    lightModeDarkenSpan: 0.5,
    darkModeLightenSpan: 1.5,
  },
  lightMode,
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
  generateCssVariables(
    {
      surface: surfaceSwatches.surface,
    },
    {
      primaryName: 'surface',
    }
  ),
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

const editorCss = `
  
  :root {
    /* AUTOMATED - regenerate using \`bun run generate-theme\` in the root of the repo */
    /* Base generated variables */
    ${ourVariables.join('\n')}
    /* Puck mapped color variables */
    ${puckVariables}

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
await Bun.write(outputPath, `${properties}\n${editorCss}\n:root{${sharedCss}}`);

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
