/**
 * We use these variables in the editor, and they're also exposed in generated dashboards
 */

export const properties = `
  @property --gradient-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 135deg;
  }
`;

export const sharedCss = `
  /* === GRADIENTS === */
  --gradient-primary: linear-gradient(var(--gradient-angle), var(--clr-primary-a0) 0%, var(--clr-primary-a30) 100%);
  --gradient-primary-hover: linear-gradient(var(--gradient-angle), var(--clr-primary-a30) 0%, var(--clr-primary-a50) 100%);
  --gradient-primary-active: linear-gradient(var(--gradient-angle), var(--clr-primary-a50) 0%, var(--clr-primary-a70) 100%);
  --gradient-text: linear-gradient(to right, var(--clr-primary-a0), var(--clr-primary-a50));
  --gradient-text-secondary: linear-gradient(to right, var(--clr-primary-a90), var(--clr-primary-a70));

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
  --shadow-error-base: 0 1px 7px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-danger-a10) 100%, black 20%) 100%, transparent 80%);
  --shadow-error-hover: 0 2px 10px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-danger-a10) 100%, black 25%) 100%, transparent 75%);
  --shadow-error-active: 0 2px 4px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-danger-a0) 100%, black 30%) 100%, transparent 70%);
  --shadow-error-focus: 0 0 0 3px color-mix(in srgb, color-mix(in srgb, var(--clr-danger-a30) 100%, black 35%) 100%, transparent 60%);
  --shadow-error-focus-sm: 0 0 0 2px color-mix(in srgb, color-mix(in srgb, var(--clr-danger-a30) 100%, black 25%) 100%, transparent 70%);

  /* Success Button Shadows (composite darken + transparency) */
  --shadow-success-base: 0 1px 7px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-success-a10) 100%, black 20%) 100%, transparent 80%);
  --shadow-success-hover: 0 2px 10px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-success-a10) 100%, black 25%) 100%, transparent 75%);
  --shadow-success-active: 0 2px 4px 0 color-mix(in srgb, color-mix(in srgb, var(--clr-success-a0) 100%, black 30%) 100%, transparent 70%);
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
  --clr-text-a0:  color-mix(in srgb, var(--clr-surface-a90) 30%, white 70%);
  --clr-text-a10: color-mix(in srgb, var(--clr-text-a0) 90%, black 10%);
  --clr-text-a20: color-mix(in srgb, var(--clr-text-a0) 80%, black 20%);
  --clr-text-a30: color-mix(in srgb, var(--clr-text-a0) 70%, black 30%);
  --clr-text-a40: color-mix(in srgb, var(--clr-text-a0) 60%, black 40%);
`;
