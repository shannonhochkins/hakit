import React from 'react';
import { BaseButton, type BaseButtonProps } from './BaseButton';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Fab.module.css';

const getFabClassName = getClassNameFactory('Fab', styles);
// Props interface for the FAB
export interface FabProps extends Omit<BaseButtonProps, 'variant'> {
  /** Icon to display in the center of the FAB */
  icon: React.ReactNode;
  /** Color variant of the FAB */
  variant?: BaseButtonProps['variant'] | 'transparent';
  /** Whether the FAB should pulse to draw attention */
  pulse?: boolean;
  /** Custom border radius for the FAB */
  borderRadius?: React.CSSProperties['borderRadius'];
  /** Whether the FAB is in a loading state */
  loading?: boolean;
  /** Position variant for floating placement */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'relative';
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
  style,
  ...props
}: FabProps) => {
  const computed = getFabClassName(
    {
      Fab: true,
      sizeXs: size === 'xs',
      sizeSm: size === 'sm',
      sizeMd: size === 'md',
      sizeLg: size === 'lg',
      variantSecondary: variant === 'secondary',
      variantTransparent: variant === 'transparent',
      variantError: variant === 'error',
      variantPrimary: !variant || variant === 'primary',
      variantSuccess: variant === 'success',
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
  return (
    <BaseButton
      className={[computed, ...positionClasses].join(' ')}
      disabled={disabled || loading}
      size={size}
      autoWidth
      tooltipProps={tooltipProps}
      variant={variant}
      style={{
        ...style,
        borderRadius: borderRadius || style?.borderRadius || '50%',
      }}
      {...props}
    >
      {loading ? null : icon}
      {children}
    </BaseButton>
  );
};
