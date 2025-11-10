import { useEffect } from 'react';
import { BreakPoint, useBreakpoint } from '@hakit/components';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useIsPageEditMode } from '@hooks/useIsPageEditMode';
import { useLocalStorage } from '@hooks/useLocalStorage';

// Breakpoint configuration matching CSS variables
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
} as const;

type BreakpointKey = keyof typeof breakpoints;

type BreakPointMap = Record<BreakPoint, boolean>;

function getActiveBreakpoint(breakpoints: BreakPointMap): BreakPoint | undefined {
  for (const key in breakpoints) {
    if (breakpoints[key as BreakPoint]) return key as BreakPoint;
  }
  return undefined;
}

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
  const dashboardBreakpoints = useBreakpoint();
  const editorMode = useIsPageEditMode();
  const [selectedBreakpointId] = useLocalStorage<BreakPoint>('selectedBreakpoint', 'xlg');

  // Initialize/sync breakpoint in editor mode from localStorage
  useEffect(() => {
    if (editorMode) {
      const { setActiveBreakpoint, activeBreakpoint, breakpointItems = [] } = useGlobalStore.getState();

      // In editor mode, don't validate against enabled/disabled status
      // User should be able to preview any breakpoint regardless of configuration
      // Only validate that the breakpoint exists in the breakpointItems at all
      let valueToSet = selectedBreakpointId;

      if (breakpointItems.length > 0) {
        const existsInBreakpoints = breakpointItems.some(bp => bp.id === selectedBreakpointId);
        if (!existsInBreakpoints) {
          valueToSet = 'xlg';
        }
      }

      // Always sync store with localStorage on mount or when localStorage changes
      if (valueToSet !== activeBreakpoint) {
        setActiveBreakpoint(valueToSet);
      }
    }
  }, [editorMode, selectedBreakpointId]); // React to localStorage changes

  useEffect(() => {
    // In editor mode, breakpoint is controlled by ViewportControls via store/localStorage
    // MediaQueries should only set breakpoint in renderer mode based on screen size
    if (editorMode) {
      return;
    }

    const currentBreakpoint = getActiveBreakpoint(dashboardBreakpoints);
    const { setActiveBreakpoint, activeBreakpoint, breakpointItems = [] } = useGlobalStore.getState();
    const options = breakpointItems.filter(item => !item.disabled);

    let newValue = currentBreakpoint;

    // If we have available options (data is ready), validate the new value
    if (options.length > 0 && newValue) {
      // Check if the new value exists in the available options
      const valueExistsInOptions = options.some(option => option.id === newValue);

      if (!valueExistsInOptions) {
        // Value doesn't exist in options, fall back to xlg
        newValue = 'xlg';
      }
    }

    // Only update if the value actually changed
    if (newValue && newValue !== activeBreakpoint) {
      setActiveBreakpoint(newValue);
    }
  }, [dashboardBreakpoints, editorMode]);

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
