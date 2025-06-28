import { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';

const TooltipSpan = styled.span<Pick<TooltipProps, 'placement'>>`
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--color-gray-800);
  color: var(--color-text-primary);
  border: 1px solid var(--color-gray-600);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2xl);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  z-index: var(--z-tooltip);
  visibility: hidden;
  opacity: 0;
  transition: var(--transition-normal);
  transition-property: opacity, visibility;
  pointer-events: none;
  user-select: none;
  max-width: 200px;
  word-wrap: break-word;
  transform: ${props => {
    switch (props.placement) {
      default:
      case 'top':
        return 'translateY(calc(-100% - var(--space-2))) translateX(-50%)';
      case 'right':
        return 'translateX(var(--space-2)) translateY(-50%)';
      case 'bottom':
        return 'translateY(var(--space-2)) translateX(-50%)';
      case 'left':
        return 'translateX(calc(-100% - var(--space-2))) translateY(-50%)';
    }
  }};
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    display: block;
    ${props => {
      switch (props.placement) {
        default:
        case 'top':
          return `
            border-width: 6px 6px 0 6px;
            border-color: var(--color-gray-800) transparent transparent transparent;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            filter: drop-shadow(0 1px 0 var(--color-gray-600));
          `;
        case 'right':
          return `
            border-width: 6px 6px 6px 0;
            border-color: transparent var(--color-gray-800) transparent transparent;
            left: 0;
            top: 50%;
            transform: translate(-100%, -50%);
            filter: drop-shadow(-1px 0 0 var(--color-gray-600));
          `;
        case 'bottom':
          return `
            border-width: 0 6px 6px 6px;
            border-color: transparent transparent var(--color-gray-800) transparent;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            filter: drop-shadow(0 -1px 0 var(--color-gray-600));
          `;
        case 'left':
          return `
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent var(--color-gray-800);
            right: 0;
            top: 50%;
            transform: translate(100%, -50%);
            filter: drop-shadow(1px 0 0 var(--color-gray-600));
          `;
      }
    }};
  }
`;

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
          <TooltipSpan className='tooltip-inner' placement={placement} ref={tooltipRef}>
            {title}
          </TooltipSpan>,
          window.document.body
        )}
    </div>
  );
}
