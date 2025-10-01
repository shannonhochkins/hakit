import { useRef, useEffect, useCallback } from 'react';
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

  const calculatePosition = useCallback(() => {
    const childRect = childRef.current?.getBoundingClientRect();
    if (typeof childRect === 'undefined' || !tooltipRef.current) return;
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
    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.left = `${left}px`;
  }, [placement]);

  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [calculatePosition]);

  const handleMouseEnter = useCallback(() => {
    const tooltipEl = tooltipRef.current;
    if (tooltipEl) {
      tooltipEl.style.opacity = '1';
      tooltipEl.style.visibility = 'visible';
      calculatePosition();
    }
  }, [calculatePosition]);

  const handleHide = useCallback(() => {
    const tooltipEl = tooltipRef.current;
    if (tooltipEl) {
      tooltipEl.style.opacity = '0';
      tooltipEl.style.visibility = 'hidden';
    }
  }, []);

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
      {typeof document !== 'undefined' &&
        createPortal(
          <span
            className={getClassName({
              TooltipSpan: true,
              top: placement === 'top',
              right: placement === 'right',
              bottom: placement === 'bottom',
              left: placement === 'left',
              noWrap: typeof title === 'string' && title.length < 20,
            })}
            ref={tooltipRef}
          >
            {title}
          </span>,
          window.document.body
        )}
    </div>
  );
}
