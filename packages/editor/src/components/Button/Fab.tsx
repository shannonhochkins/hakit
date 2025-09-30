import React from 'react';
import { ButtonHTMLAttributes } from 'react';
import { Tooltip, TooltipProps } from '@components/Tooltip';
import { BaseButton } from './BaseButton';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Fab.module.css';

const getFabClassName = getClassNameFactory('Fab', styles);
// Props interface for the FAB
export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display in the center of the FAB */
  icon: React.ReactNode;
  /** Size variant of the FAB */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Color variant of the FAB */
  variant?: 'primary' | 'secondary' | 'transparent' | 'error';
  /** Whether the FAB should pulse to draw attention */
  pulse?: boolean;
  /** Custom border radius for the FAB */
  borderRadius?: string;
  /** Whether the FAB is in a loading state */
  loading?: boolean;
  /** Position variant for floating placement */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'relative';
  /** Custom label for accessibility */
  'aria-label': string;
  /** override the tooltip props */
  tooltipProps?: Partial<TooltipProps>;
  /** if the button should appear active */
  active?: boolean;
}

// React component wrapper
export const Fab = ({
  icon,
  loading,
  disabled,
  size = 'md',
  variant = 'primary',
  position = 'relative',
  pulse = false,
  children,
  tooltipProps = {},
  active,
  className,
  borderRadius = '50%',
  ...props
}: FabProps) => {
  const computed = getFabClassName(
    {
      sizeXs: size === 'xs',
      sizeSm: size === 'sm',
      sizeMd: size === 'md',
      sizeLg: size === 'lg',
      variantSecondary: variant === 'secondary',
      variantTransparent: variant === 'transparent',
      variantError: variant === 'error',
      variantPrimary: !variant || variant === 'primary',
      pulse: pulse && !loading,
      loading: !!loading,
      active: !!active,
    },
    className
  );
  const positionClasses =
    position === 'relative'
      ? [styles.positionRelative]
      : [
          styles.positionFixed,
          position === 'bottom-left'
            ? styles.bottomLeft
            : position === 'top-right'
              ? styles.topRight
              : position === 'top-left'
                ? styles.topLeft
                : styles.bottomRight,
        ];
  const style = { ...(props.style || {}), borderRadius: borderRadius || '50%' } as React.CSSProperties;
  return (
    <Tooltip title={props['aria-label'] || ''} placement='top' {...tooltipProps}>
      <BaseButton
        className={[computed, ...positionClasses].join(' ')}
        disabled={disabled || loading}
        style={style}
        size={size}
        autoWidth
        {...props}
      >
        {loading ? null : icon}
        {children}
      </BaseButton>
    </Tooltip>
  );
};
