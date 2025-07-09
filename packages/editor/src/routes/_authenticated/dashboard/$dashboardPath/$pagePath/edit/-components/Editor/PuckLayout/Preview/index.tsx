import { Puck } from '@measured/puck';
import { BreakPoint, Column, Row } from '@hakit/components';
import styled from '@emotion/styled';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '@lib/hooks/useLocalStorage';

const CanvasWrapper = styled(Column)`
  width: 100%;
  max-width: 100%;
  padding: var(--space-4);
  border-radius: 4px;
  overflow: hidden;

  --dot-bg: var(--color-gray-950);
  --dot-color: var(--color-gray-600);
  --dot-size: 1px;
  --dot-space: 22px;
  background:
    linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space)
      var(--dot-space),
    linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
    var(--dot-color);
`;

const PreviewContainer = styled.div`
  transform-origin: center center;
  transition: transform 0.2s ease-in-out;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Preview Component
 *
 * This component handles the visual presentation and scaling of the Puck editor preview:
 *
 * 1. **Automatic Scaling**: Scales content to fit within available space based on canvas width
 * 2. **XLG Breakpoint**: Uses 100% width for xlg breakpoint, fixed width for others
 * 3. **Zoom Controls**: Responds to zoom changes from toolbar controls
 * 4. **Performance Optimized**: Uses refs and direct DOM manipulation to avoid re-renders
 *
 * Note: Viewport/breakpoint selection logic is handled by ViewportControls component.
 */
export function Preview() {
  const [activeBreakpoint] = useLocalStorage<BreakPoint>('selectedBreakpoint');
  const previewCanvasWidth = useGlobalStore(store => store.previewCanvasWidth);
  const previewZoom = useGlobalStore(store => store.previewZoom);
  const setPreviewZoom = useGlobalStore(store => store.setPreviewZoom);

  // Refs for direct DOM manipulation (avoid re-renders)
  const containerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track values without triggering re-renders
  const availableWidthRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(previewZoom);
  const lastCanvasWidthRef = useRef<number>(previewCanvasWidth);
  const lastBreakpointRef = useRef<BreakPoint | undefined>(activeBreakpoint);

  // Calculate zoom based on available space and desired width
  const calculateOptimalZoom = useCallback((targetWidth: number, availableWidth: number) => {
    if (targetWidth <= 0 || availableWidth <= 0) return 1;
    const calculatedZoom = Math.min(1, availableWidth / targetWidth);
    return Math.max(0.1, calculatedZoom); // Minimum zoom of 10%
  }, []);

  // Update CSS transform directly on DOM element
  const updateZoomTransform = useCallback((zoom: number) => {
    if (previewContainerRef.current) {
      previewContainerRef.current.style.transform = `scale(${zoom})`;
    }
  }, []);

  // Update content width directly on DOM element
  const updateContentWidth = useCallback((width: string, minWidth?: string) => {
    if (contentRef.current) {
      contentRef.current.style.width = width;
      contentRef.current.style.minWidth = minWidth || '';
    }
  }, []);

  // Get display width based on breakpoint
  const getDisplayWidth = useCallback(() => {
    // For xlg, use 100% width (fill container) but keep minWidth as the xlg breakpoint
    if (activeBreakpoint === 'xlg') {
      return { width: '100%', minWidth: previewCanvasWidth > 0 ? `${previewCanvasWidth}px` : undefined };
    }

    // For other breakpoints, use fixed width
    if (previewCanvasWidth > 0) {
      return { width: `${previewCanvasWidth}px`, minWidth: undefined };
    }
    return { width: '100%', minWidth: undefined };
  }, [activeBreakpoint, previewCanvasWidth]);

  // Update available space without causing re-renders
  const updateAvailableSpace = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 32; // var(--space-4) * 2
      const newWidth = rect.width - padding;

      // Only update if width has changed significantly
      if (Math.abs(newWidth - availableWidthRef.current) > 1) {
        availableWidthRef.current = newWidth;

        // Trigger zoom recalculation
        if (previewCanvasWidth > 0) {
          const newZoom = calculateOptimalZoom(previewCanvasWidth, newWidth);

          if (Math.abs(newZoom - lastZoomRef.current) > 0.01) {
            lastZoomRef.current = newZoom;
            setPreviewZoom(newZoom);
            updateZoomTransform(newZoom);
          }
        }
      }
    }
  }, [previewCanvasWidth, calculateOptimalZoom, setPreviewZoom, updateZoomTransform]);

  // Set up resize observers and listeners
  useEffect(() => {
    updateAvailableSpace();
    window.addEventListener('resize', updateAvailableSpace);

    // Use ResizeObserver for more accurate container size tracking
    const resizeObserver = new ResizeObserver(updateAvailableSpace);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateAvailableSpace);
      resizeObserver.disconnect();
    };
  }, [updateAvailableSpace]);

  // Update zoom when external zoom changes (e.g., from zoom controls)
  useEffect(() => {
    if (Math.abs(previewZoom - lastZoomRef.current) > 0.01) {
      lastZoomRef.current = previewZoom;
      updateZoomTransform(previewZoom);
    }
  }, [previewZoom, updateZoomTransform]);

  // Update content width when canvas width or breakpoint changes
  useEffect(() => {
    const { width, minWidth } = getDisplayWidth();
    updateContentWidth(width, minWidth);

    if (previewCanvasWidth !== lastCanvasWidthRef.current || activeBreakpoint !== lastBreakpointRef.current) {
      lastCanvasWidthRef.current = previewCanvasWidth;
      lastBreakpointRef.current = activeBreakpoint;

      // Recalculate zoom if canvas width changed
      if (availableWidthRef.current > 0 && previewCanvasWidth > 0) {
        const newZoom = calculateOptimalZoom(previewCanvasWidth, availableWidthRef.current);

        if (Math.abs(newZoom - lastZoomRef.current) > 0.01) {
          lastZoomRef.current = newZoom;
          setPreviewZoom(newZoom);
          updateZoomTransform(newZoom);
        }
      }
    }
  }, [
    previewCanvasWidth,
    activeBreakpoint,
    getDisplayWidth,
    updateContentWidth,
    calculateOptimalZoom,
    setPreviewZoom,
    updateZoomTransform,
  ]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CanvasWrapper fullHeight alignItems='center' justifyContent='stretch' wrap='nowrap' gap='0px'>
        <Row
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'visible', // Always visible since we're always using auto-scaling
          }}
        >
          <PreviewContainer ref={previewContainerRef} className='preview-container'>
            <div
              className='preview-content'
              ref={contentRef}
              style={{
                // Initial values - will be updated via refs
                height: '100%',
                width: '100%',
              }}
            >
              {previewCanvasWidth > 0 && <Puck.Preview />}
            </div>
          </PreviewContainer>
        </Row>
      </CanvasWrapper>
    </div>
  );
}
