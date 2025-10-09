import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TooltipSpan', styles);

export interface TooltipProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  /** the placement of the tooltip @default 'top' */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /** the title of the tooltip */
  title?: React.ReactNode | null;
  /** the children of the tooltip */
  children: React.ReactNode;
}

// Shared portal container for all tooltips
let tooltipRoot: HTMLDivElement | null = null;
function getTooltipRoot(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;
  if (!tooltipRoot) {
    tooltipRoot = document.createElement('div');
    tooltipRoot.setAttribute('id', 'hakit-tooltip-root');
    // Ensure the root does not capture pointer events
    tooltipRoot.style.position = 'fixed';
    tooltipRoot.style.top = '0';
    tooltipRoot.style.left = '0';
    tooltipRoot.style.width = '0';
    tooltipRoot.style.height = '0';
    tooltipRoot.style.pointerEvents = 'none';
    document.body.appendChild(tooltipRoot);
  }
  return tooltipRoot;
}

// Simple global coordination so only one tooltip is visible at a time
let tooltipIdCounter = 0;
let activeTooltipId: number | null = null;
const subscribers = new Set<(id: number | null) => void>();
function subscribeActiveTooltip(listener: (id: number | null) => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}
function setActiveTooltip(id: number | null) {
  activeTooltipId = id;
  subscribers.forEach(l => {
    try {
      l(activeTooltipId);
    } catch {
      // ignore listener errors
    }
  });
}

export function Tooltip({ placement = 'top', title = null, children, ...rest }: TooltipProps) {
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const childRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const rafMeasureRef = useRef<number | null>(null);
  const idRef = useRef<number>(0);
  if (idRef.current === 0) {
    tooltipIdCounter += 1;
    idRef.current = tooltipIdCounter;
  }

  const calculatePosition = useCallback(() => {
    const childRect = childRef.current?.getBoundingClientRect();
    const tooltip = tooltipRef.current;

    if (!childRect || !tooltip) {
      return;
    }

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = childRect.top;
        left = childRect.left + childRect.width / 2;
        break;
      case 'right':
        top = childRect.top + childRect.height / 2;
        left = childRect.right;
        break;
      case 'bottom':
        top = childRect.bottom;
        left = childRect.left + childRect.width / 2;
        break;
      case 'left':
        top = childRect.top + childRect.height / 2;
        left = childRect.left;
        break;
    }

    // Position relative to viewport; tooltip CSS should handle transform for arrow/offset
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }, [placement]);

  // Ref callback to calculate position when tooltip element is mounted
  const tooltipRefCallback = useCallback(
    (node: HTMLSpanElement | null) => {
      tooltipRef.current = node;
      if (node) {
        // Calculate position immediately when element is attached to DOM
        // Use double RAF to ensure layout has been calculated
        rafMeasureRef.current = requestAnimationFrame(() => {
          rafMeasureRef.current = requestAnimationFrame(() => {
            calculatePosition();
          });
        });
      }
    },
    [calculatePosition]
  );

  // Recalculate position when shouldRender becomes true (tooltip is mounted)
  useEffect(() => {
    if (shouldRender) {
      const onResize = () => {
        if (rafMeasureRef.current != null) cancelAnimationFrame(rafMeasureRef.current);
        rafMeasureRef.current = requestAnimationFrame(calculatePosition);
      };
      const onScroll = () => {
        if (rafMeasureRef.current != null) cancelAnimationFrame(rafMeasureRef.current);
        rafMeasureRef.current = requestAnimationFrame(calculatePosition);
      };

      const onVisibility = () => {
        if (document.visibilityState === 'hidden') {
          setIsVisible(false);
          setShouldRender(false);
          if (activeTooltipId === idRef.current) setActiveTooltip(null);
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsVisible(false);
          setShouldRender(false);
          if (activeTooltipId === idRef.current) setActiveTooltip(null);
        }
      };

      const onPointerDown = () => {
        setIsVisible(false);
        setShouldRender(false);
        if (activeTooltipId === idRef.current) setActiveTooltip(null);
      };

      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('pointerdown', onPointerDown, true);

      return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVisibility);
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('pointerdown', onPointerDown, true);
        if (rafMeasureRef.current != null) cancelAnimationFrame(rafMeasureRef.current);
      };
    }
  }, [shouldRender, calculatePosition]);

  const handleMouseEnter = useCallback(() => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Deactivate any other tooltip
    setActiveTooltip(idRef.current);
    setShouldRender(true);
    // Set visible in next frame after portal renders
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleHide = useCallback(() => {
    setIsVisible(false);
    // Don't unmount immediately - let CSS transition complete
    // The transition will trigger transitionend event
    if (activeTooltipId === idRef.current) setActiveTooltip(null);
  }, []);

  // Handle transitionend to unmount after fade out
  const handleTransitionEnd = useCallback(() => {
    if (!isVisible) {
      setShouldRender(false);
    }
  }, [isVisible]);

  // Subscribe to active tooltip changes to hide when another tooltip is shown
  useEffect(() => {
    const unsubscribe = subscribeActiveTooltip(activeId => {
      if (activeId !== idRef.current && (isVisible || shouldRender)) {
        setIsVisible(false);
        setShouldRender(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [isVisible, shouldRender]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (rafMeasureRef.current != null) cancelAnimationFrame(rafMeasureRef.current);
      if (activeTooltipId === idRef.current) setActiveTooltip(null);
    };
  }, []);

  const tooltipStyles: React.CSSProperties = useMemo(() => {
    return {
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      // Ensure the tooltip can receive pointer events when visible (for transitions)
      pointerEvents: isVisible ? 'auto' : 'none',
      position: 'fixed',
    };
  }, [isVisible]);

  if (title === null || title === '') {
    return children;
  }

  return (
    <div
      ref={childRef}
      onBlur={handleHide}
      onTouchEnd={handleHide}
      onTouchStart={handleMouseEnter}
      onMouseUp={handleHide}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleHide}
      aria-haspopup='true'
      {...rest}
    >
      {children}
      {shouldRender &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role='tooltip'
            className={getClassName({
              TooltipSpan: true,
              top: placement === 'top',
              right: placement === 'right',
              bottom: placement === 'bottom',
              left: placement === 'left',
              noWrap: typeof title === 'string' && title.length < 20,
              visible: isVisible,
            })}
            ref={tooltipRefCallback}
            onTransitionEnd={handleTransitionEnd}
            style={tooltipStyles}
          >
            {title}
          </span>,
          getTooltipRoot() as HTMLDivElement
        )}
    </div>
  );
}
