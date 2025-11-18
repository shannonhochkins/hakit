import React, { createElement, useMemo } from 'react';
import { BaseButton, type BaseButtonProps } from './BaseButton';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Fab.module.css';
import { icons, LucideProps } from 'lucide-react';

const getFabClassName = getClassNameFactory('Fab', styles);
// Props interface for the FAB
export interface FabProps extends Omit<BaseButtonProps, 'variant' | 'startIcon' | 'endIcon' | 'startIconProps' | 'endIconProps'> {
  /** Icon to display in the center of the FAB */
  icon: Exclude<React.ReactNode, 'string'> | keyof typeof icons;
  /** Icon props to display in the center of the fab */
  iconProps?: LucideProps;
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
  iconProps,
  loading,
  disabled,
  size = 'md',
  variant = 'primary',
  position = 'relative',
  pulse = false,
  children,
  tooltipProps,
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
      variantDanger: variant === 'danger',
      variantPrimary: !variant || variant === 'primary',
      variantSuccess: variant === 'success',
      pulse: pulse && !loading,
      loading: !!loading,
      active: !!active,
    },
    className
  );
  const posClasses = getFabClassName({
    positionRelative: position === 'relative',
    positionFixed: position === 'bottom-left' || position === 'top-right' || position === 'top-left' || position === 'bottom-right',
    bottomLeft: position === 'bottom-left',
    topRight: position === 'top-right',
    topLeft: position === 'top-left',
    bottomRight: position === 'bottom-right',
  });

  const fabClassName = useMemo(() => [computed, ...posClasses].join(' '), [computed, posClasses]);

  const styles = useMemo(() => {
    return {
      ...style,
      borderRadius: borderRadius || style?.borderRadius || '50%',
    };
  }, [style, borderRadius]);

  const iconElement = useMemo(() => {
    if (typeof icon === 'string' && icon in icons) {
      const IconComponent = icons[icon as keyof typeof icons];
      return createElement(IconComponent, iconProps);
    }
    return icon;
  }, [icon, iconProps]);

  return (
    <BaseButton
      className={fabClassName}
      disabled={disabled || loading}
      size={size}
      autoWidth
      tooltipProps={tooltipProps}
      variant={variant}
      style={styles}
      active={active}
      {...props}
    >
      {loading ? null : iconElement}
      {children}
    </BaseButton>
  );
};
