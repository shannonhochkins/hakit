import { Puck } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useCallback, useEffect, useRef } from 'react';
import styles from './Preview.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const getClassName = getClassNameFactory('Preview', styles);

/**
 * Preview Component
 *
 * Responsibilities:
 * 1. Display the Puck editor preview with the correct canvas width
 * 2. Automatically calculate and apply zoom to fit content in available space
 * 3. Respond to window/container resize events
 * 4. Handle xlg breakpoint specially (100% width with minWidth)
 *
 * Note: Breakpoint selection is handled by ViewportControls and MediaQueries components.
 */
export function Preview() {
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  const previewCanvasWidth = useGlobalStore(store => store.previewCanvasWidth);
  const setPreviewZoom = useGlobalStore(store => store.setPreviewZoom);

  // Refs for direct DOM manipulation (avoid re-renders)
  const containerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate and apply zoom based on available space
  const calculateAndApplyZoom = useCallback(() => {
    if (!containerRef.current || !previewContainerRef.current || !contentRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const padding = 32; // var(--space-4) * 2
    const availableWidth = containerRect.width - padding;

    if (availableWidth <= 0 || previewCanvasWidth <= 0) return;

    // For xlg, the content uses 100% width but has a minWidth
    // We need to calculate zoom based on the actual rendered width (which is the minWidth when it can't fit)
    if (activeBreakpoint === 'xlg') {
      // The content will be either 100% of container or minWidth (whichever is larger)
      // If minWidth is larger than available width, we need to zoom down
      const contentWidth = Math.max(availableWidth, previewCanvasWidth);
      const zoom = Math.min(1, availableWidth / contentWidth);
      const clampedZoom = Math.max(0.1, zoom); // Minimum 10% zoom

      previewContainerRef.current.style.transform = `scale(${clampedZoom})`;
      setPreviewZoom(clampedZoom);
      return;
    }

    // For other breakpoints, calculate zoom to fit fixed canvas width in available space
    const zoom = Math.min(1, availableWidth / previewCanvasWidth);
    const clampedZoom = Math.max(0.1, zoom); // Minimum 10% zoom

    previewContainerRef.current.style.transform = `scale(${clampedZoom})`;
    setPreviewZoom(clampedZoom);
  }, [activeBreakpoint, previewCanvasWidth, setPreviewZoom]);

  // Set content width based on breakpoint
  useEffect(() => {
    if (!contentRef.current) return;

    if (activeBreakpoint === 'xlg') {
      // xlg uses 100% width with minWidth
      contentRef.current.style.width = '100%';
      contentRef.current.style.minWidth = previewCanvasWidth > 0 ? `${previewCanvasWidth}px` : '';
    } else if (previewCanvasWidth > 0) {
      // Other breakpoints use fixed width
      contentRef.current.style.width = `${previewCanvasWidth}px`;
      contentRef.current.style.minWidth = '';
    }
  }, [activeBreakpoint, previewCanvasWidth]);

  // Recalculate zoom when breakpoint or canvas width changes
  useEffect(() => {
    calculateAndApplyZoom();
  }, [calculateAndApplyZoom]);

  // Set up resize observers for automatic zoom adjustment
  useEffect(() => {
    const resizeObserver = new ResizeObserver(calculateAndApplyZoom);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateAndApplyZoom);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateAndApplyZoom);
    };
  }, [calculateAndApplyZoom]);

  return (
    <div ref={containerRef} className={getClassName('Preview-Container')}>
      <div className={getClassName('Preview-CanvasWrapper')}>
        <div className={getClassName('Preview-Row')}>
          <div ref={previewContainerRef} className={getClassName('Preview-PreviewContainer')}>
            <div className={getClassName('Preview-Content')} ref={contentRef}>
              {previewCanvasWidth > 0 && <Puck.Preview />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
