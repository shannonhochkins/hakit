import { useEffect } from 'react';

// Breakpoint configuration matching CSS variables
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
} as const;

type BreakpointKey = keyof typeof breakpoints;

/**
 * MediaQueries component that dynamically adds breakpoint classes to the body element.
 *
 * Classes added:
 * - .mq-xs: < 640px
 * - .mq-sm: >= 640px
 * - .mq-md: >= 768px
 * - .mq-lg: >= 1024px
 * - .mq-xl: >= 1200px
 *
 * Only the current active breakpoint class is applied at any time.
 */
export function MediaQueries() {
  useEffect(() => {
    const updateBreakpointClass = () => {
      const width = window.innerWidth;
      const body = document.body;

      // Remove all existing breakpoint classes
      body.classList.remove('mq-xs', 'mq-sm', 'mq-md', 'mq-lg', 'mq-xl');

      // Determine current breakpoint
      let currentBreakpoint: BreakpointKey | 'xs' = 'xs';

      if (width >= breakpoints.xl) {
        currentBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        currentBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        currentBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        currentBreakpoint = 'sm';
      }

      // Add the current breakpoint class
      body.classList.add(`mq-${currentBreakpoint}`);
    };

    // Set initial breakpoint class
    updateBreakpointClass();

    // Listen for window resize
    window.addEventListener('resize', updateBreakpointClass);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateBreakpointClass);
      // Clean up classes on unmount
      document.body.classList.remove('mq-xs', 'mq-sm', 'mq-md', 'mq-lg', 'mq-xl');
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Export breakpoints for use in other components if needed
export { breakpoints };
