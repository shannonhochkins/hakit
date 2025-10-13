import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';

type AutoHeightProps = {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  onCollapseComplete?: () => void;
  renderChildren?: boolean;
};

export const AutoHeight = ({
  isOpen,
  children,
  duration = 300,
  className,
  style,
  onCollapseComplete,
  renderChildren: keepChildrenRendered = false,
}: AutoHeightProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderChildren, setRenderChildren] = useState(isOpen || keepChildrenRendered);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const hasMountedRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // Ensure children are present before measuring during expand
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If keepChildrenRendered is true, always render children but still animate
    if (keepChildrenRendered) {
      // On first render only
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        if (isOpen) {
          // Start open: skip animation
          setShouldAnimate(false);
          el.style.height = 'auto';
          isAnimatingRef.current = false;
        } else {
          // Start collapsed: set height to 0
          el.style.height = '0px';
          isAnimatingRef.current = false;
        }
        return;
      }

      // Prevent redundant animations
      if (isAnimatingRef.current) return;

      if (isOpen) {
        if (el.style.height === 'auto') {
          // Already open, no need to animate
          return;
        }

        isAnimatingRef.current = true;
        el.style.height = '0px';

        rafRef.current = requestAnimationFrame(() => {
          const scrollHeight = el.scrollHeight;
          setShouldAnimate(true);
          el.style.transition = `height ${duration}ms ease`;
          el.style.height = `${scrollHeight}px`;

          animationTimeoutRef.current = setTimeout(() => {
            el.style.transition = '';
            el.style.height = 'auto';
            isAnimatingRef.current = false;
            animationTimeoutRef.current = null;
          }, duration);
        });
      } else {
        if (el.style.height === '0px') {
          // Already collapsed, no need to animate
          return;
        }

        isAnimatingRef.current = true;
        const currentHeight = el.scrollHeight;
        el.style.height = `${currentHeight}px`;

        rafRef.current = requestAnimationFrame(() => {
          setShouldAnimate(true);
          el.style.transition = `height ${duration}ms ease`;
          el.style.height = '0px';

          animationTimeoutRef.current = setTimeout(() => {
            isAnimatingRef.current = false;
            animationTimeoutRef.current = null;
            if (onCollapseComplete) onCollapseComplete();
          }, duration);
        });
      }
      return;
    }

    // Cleanup any ongoing animations
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // On first render only
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (isOpen) {
        // Start open: skip animation
        setRenderChildren(true);
        setShouldAnimate(false);
        el.style.height = 'auto';
        isAnimatingRef.current = false;
      } else {
        // Start collapsed: do nothing, wait for open to trigger animation
        setRenderChildren(false);
        isAnimatingRef.current = false;
      }
      return;
    }

    // Prevent redundant animations
    if (isAnimatingRef.current) return;

    if (isOpen) {
      if (renderChildren && el.style.height === 'auto') {
        // Already open and rendered, no need to animate
        return;
      }

      isAnimatingRef.current = true;
      setRenderChildren(true);
      el.style.height = '0px';

      rafRef.current = requestAnimationFrame(() => {
        const scrollHeight = el.scrollHeight;
        setShouldAnimate(true);
        el.style.transition = `height ${duration}ms ease`;
        el.style.height = `${scrollHeight}px`;

        animationTimeoutRef.current = setTimeout(() => {
          el.style.transition = '';
          el.style.height = 'auto';
          isAnimatingRef.current = false;
          animationTimeoutRef.current = null;
        }, duration);
      });
    } else {
      if (!renderChildren) {
        // Already collapsed, no need to animate
        return;
      }

      isAnimatingRef.current = true;
      const currentHeight = el.scrollHeight;
      el.style.height = `${currentHeight}px`;

      rafRef.current = requestAnimationFrame(() => {
        setShouldAnimate(true);
        el.style.transition = `height ${duration}ms ease`;
        el.style.height = '0px';

        animationTimeoutRef.current = setTimeout(() => {
          setRenderChildren(false);
          isAnimatingRef.current = false;
          animationTimeoutRef.current = null;
          if (onCollapseComplete) onCollapseComplete();
        }, duration);
      });
    }

    // Cleanup function
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [isOpen, duration, onCollapseComplete, renderChildren, keepChildrenRendered]);

  const styles = useMemo(() => {
    return {
      overflow: 'hidden',
      height: isOpen && !shouldAnimate ? 'auto' : undefined,
      ...style,
    };
  }, [isOpen, shouldAnimate, style]);

  return (
    <div ref={containerRef} className={className} style={styles}>
      {renderChildren || keepChildrenRendered ? children : null}
    </div>
  );
};
