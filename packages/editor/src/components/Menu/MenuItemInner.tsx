import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './MenuItemInner.module.css';

export interface MenuItemInnerProps extends React.ComponentPropsWithoutRef<'button'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode; // new end icon region for chevrons or custom adornments
  'data-highlighted'?: string;
}

export function MenuItemInner({ onClick, disabled = false, startIcon, endIcon, children, className, ...rest }: MenuItemInnerProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [highlighted, setHighlighted] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    },
    [onClick, disabled]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <button
      ref={ref}
      role='menuitem'
      aria-disabled={disabled}
      data-highlighted={highlighted ? 'true' : 'false'}
      className={`${styles.menuItem} ${className ?? ''}`}
      onMouseEnter={() => setHighlighted(true)}
      onMouseLeave={() => setHighlighted(false)}
      onFocus={() => setHighlighted(true)}
      onBlur={() => setHighlighted(false)}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      {startIcon ? <span className={styles.menuItemIcon}>{startIcon}</span> : null}
      <span className={styles.menuItemLabel}>{children}</span>
      {endIcon ? <span className={styles.menuItemIcon}>{endIcon}</span> : null}
    </button>
  );
}

MenuItemInner.displayName = 'MenuItemInner';
