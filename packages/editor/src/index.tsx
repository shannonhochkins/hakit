import { scan } from 'react-scan';
scan({
  enabled: true,
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@measured/puck/puck.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ToastContainer } from 'react-toastify';
import { MediaQueries } from '@components/MediaQueries';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { css, Global } from '@emotion/react';
//
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // ← the magic switch
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable the experimental feature flag for React 19 compatibility
      experimental_prefetchInRender: true,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <QueryClientProvider client={queryClient}>
        <MediaQueries />
        <RouterProvider router={router} />
      </QueryClientProvider>
      <ToastContainer stacked />
      <CssBaseline />
      <Global
        styles={css`
          :root {
            /* === COLOR SYSTEM === */
            /* Primary Brand Colors */
            --color-primary-50: rgb(239, 246, 255);
            --color-primary-100: rgb(219, 234, 254);
            --color-primary-200: rgb(191, 219, 254);
            --color-primary-300: rgb(147, 197, 253);
            --color-primary-400: rgb(96, 165, 250);
            --color-primary-500: rgb(59, 130, 246);
            --color-primary-600: rgb(37, 99, 235);
            --color-primary-700: rgb(29, 78, 216);
            --color-primary-800: rgb(30, 64, 175);
            --color-primary-900: rgb(30, 58, 138);

            /* Secondary Accent Colors */
            --color-secondary-50: rgb(236, 254, 255);
            --color-secondary-100: rgb(207, 250, 254);
            --color-secondary-200: rgb(165, 243, 252);
            --color-secondary-300: rgb(103, 232, 249);
            --color-secondary-400: rgb(34, 211, 238);
            --color-secondary-500: rgb(6, 182, 212);
            --color-secondary-600: rgb(8, 145, 178);
            --color-secondary-700: rgb(14, 116, 144);
            --color-secondary-800: rgb(21, 94, 117);
            --color-secondary-900: rgb(22, 78, 99);

            /* Neutral Colors */
            --color-gray-50: rgb(249, 250, 251);
            --color-gray-100: rgb(243, 244, 246);
            --color-gray-200: rgb(229, 231, 235);
            --color-gray-300: rgb(209, 213, 219);
            --color-gray-400: rgb(156, 163, 175);
            --color-gray-500: rgb(107, 114, 128);
            --color-gray-600: rgb(75, 85, 99);
            --color-gray-700: rgb(55, 65, 81);
            --color-gray-750: rgb(42, 52, 68);
            --color-gray-800: rgb(31, 41, 55);
            --color-gray-850: rgb(24, 32, 46);
            --color-gray-900: rgb(17, 24, 39);
            --color-gray-950: rgb(3, 7, 18);

            /* Semantic Colors */
            --color-surface: var(--color-gray-850);
            --color-surface-elevated: var(--color-gray-800);
            --color-surface-inset: var(--color-gray-900);
            --color-surface-muted: var(--color-gray-850);
            --color-surface-overlay: rgba(3, 7, 18, 0.8);
            --color-border: var(--color-gray-700);
            --color-border-hover: var(--color-gray-600);
            --color-border-subtle: var(--color-gray-800);

            /* Text Colors */
            --color-text-primary: rgb(255, 255, 255);
            --color-text-secondary: var(--color-gray-300);
            --color-text-muted: var(--color-gray-400);
            --color-text-disabled: var(--color-gray-500);

            /* Status Colors */
            --color-success-50: rgb(240, 253, 244);
            --color-success-100: rgb(220, 252, 231);
            --color-success-200: rgb(187, 247, 208);
            --color-success-300: rgb(134, 239, 172);
            --color-success-400: rgb(74, 222, 128);
            --color-success-500: rgb(34, 197, 94);
            --color-success-600: rgb(22, 163, 74);
            --color-success-700: rgb(21, 128, 61);
            --color-success-800: rgb(22, 101, 52);
            --color-success-900: rgb(20, 83, 45);

            --color-warning-50: rgb(255, 251, 235);
            --color-warning-100: rgb(254, 243, 199);
            --color-warning-200: rgb(253, 230, 138);
            --color-warning-300: rgb(252, 211, 77);
            --color-warning-400: rgb(251, 191, 36);
            --color-warning-500: rgb(245, 158, 11);
            --color-warning-600: rgb(217, 119, 6);
            --color-warning-700: rgb(180, 83, 9);
            --color-warning-800: rgb(146, 64, 14);
            --color-warning-900: rgb(120, 53, 15);

            --color-error-50: rgb(254, 242, 242);
            --color-error-100: rgb(254, 226, 226);
            --color-error-200: rgb(254, 202, 202);
            --color-error-300: rgb(252, 165, 165);
            --color-error-400: rgb(248, 113, 113);
            --color-error-500: rgb(239, 68, 68);
            --color-error-600: rgb(220, 38, 38);
            --color-error-700: rgb(185, 28, 28);
            --color-error-800: rgb(153, 27, 27);
            --color-error-900: rgb(127, 29, 29);

            /* === GRADIENTS === */
            --gradient-primary: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-400) 100%);
            --gradient-primary-hover: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-secondary-500) 100%);
            --gradient-primary-active: linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-secondary-600) 100%);
            --gradient-text: linear-gradient(to right, var(--color-primary-400), var(--color-secondary-300));
            --gradient-text-secondary: linear-gradient(to right, var(--color-text-primary), rgb(201, 248, 255));

            /* === SHADOWS === */
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

            /* Primary Button Shadows */
            --shadow-primary-base: 0 1px 7px 0 rgba(59, 130, 246, 0.15);
            --shadow-primary-hover: 0 2px 10px 0 rgba(59, 130, 246, 0.25);
            --shadow-primary-active: 0 2px 4px 0 rgba(59, 130, 246, 0.3);
            --shadow-primary-focus: 0 0 0 3px rgba(59, 130, 246, 0.4);

            /* error Button Shadows */
            --shadow-error-base: 0 1px 7px 0 rgba(239, 68, 68, 0.15);
            --shadow-error-hover: 0 2px 10px 0 rgba(239, 68, 68, 0.25);
            --shadow-error-active: 0 2px 4px 0 rgba(239, 68, 68, 0.35);
            --shadow-error-focus: 0 0 0 3px rgba(239, 68, 68, 0.3);

            /* success Button Shadows */
            --shadow-success-base: 0 1px 7px 0 rgba(34, 197, 94, 0.15);
            --shadow-success-hover: 0 2px 10px 0 rgba(34, 197, 94, 0.25);
            --shadow-success-active: 0 2px 4px 0 rgba(34, 197, 94, 0.35);
            --shadow-success-focus: 0 0 0 3px rgba(34, 197, 94, 0.3);

            /* === TYPOGRAPHY === */
            --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
          }

          #root {
            height: 100%;
          }

          /* Base styles for consistent typography */
          body {
            font-family: var(--font-family);
            color: var(--color-text-primary);
            background-color: var(--color-gray-950);
          }
        `}
      />
    </ThemeProvider>
  </React.StrictMode>
);
