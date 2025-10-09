import { useRef, useEffect, useCallback, useState } from 'react';
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

export function Tooltip({ placement = 'top', title = null, children, ...rest }: TooltipProps) {
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const childRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

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
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
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
      // Add resize listener while tooltip is shown
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [shouldRender, calculatePosition]);

  const handleMouseEnter = useCallback(() => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

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
  }, []);

  // Handle transitionend to unmount after fade out
  const handleTransitionEnd = useCallback(() => {
    if (!isVisible) {
      setShouldRender(false);
    }
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
      {...rest}
    >
      {children}
      {shouldRender &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
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
            style={{
              opacity: isVisible ? 1 : 0,
              visibility: isVisible ? 'visible' : 'hidden',
            }}
          >
            {title}
          </span>,
          window.document.body
        )}
    </div>
  );
}
