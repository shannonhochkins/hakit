import React, { memo, useCallback, useMemo } from 'react';
import { Tooltip, TooltipProps } from '@components/Tooltip';
import styles from './BaseButton.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('BaseButton', styles);

// Base props interface shared by all button types
export interface BaseButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Size variant of the button */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Wether the button should span full height */
  fullHeight?: boolean;
  /** auto width should be applied */
  autoWidth?: boolean;
  /** Custom icon to display before text */
  startIcon?: React.ReactNode;
  /** Custom icon to display after text */
  endIcon?: React.ReactNode;
  /** Custom label for accessibility */
  'aria-label': string;
  /** override the tooltip props */
  tooltipProps?: Partial<TooltipProps>;
  /** Custom className to apply to the button */
  className?: string;
  /** Badge content to display on the button */
  badge?: React.ReactNode;
  /** Props to pass to the badge container div */
  badgeProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Accessibility label for the badge */
  'badge-aria-label'?: string;
  /** Tooltip props for the badge */
  badgeTooltipProps?: Partial<TooltipProps>;
  /** Variant for styling (used for badge variant inheritance) */
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'transparent';
  /** Badge variant override (defaults to button variant) */
  badgeVariant?: 'primary' | 'secondary' | 'error' | 'success' | 'transparent';
  /** Wrapper style for the outer div */
  wrapperStyle?: React.CSSProperties;
  /** active state */
  active?: boolean;
}

// React component wrapper with all logic
const BaseButtonPrivate = ({
  children,
  startIcon,
  endIcon,
  loading,
  disabled,
  size = 'md',
  fullWidth = false,
  fullHeight = false,
  autoWidth,
  tooltipProps,
  badge,
  badgeProps,
  badgeTooltipProps,
  variant,
  badgeVariant,
  active,
  ...props
}: BaseButtonProps) => {
  const { className: providedClassName, style: providedStyle, 'badge-aria-label': badgeAriaLabel, wrapperStyle, ...restProps } = props;

  // Use badgeVariant if provided, otherwise inherit from button variant
  const effectiveBadgeVariant = badgeVariant ?? variant ?? 'primary';
  const className = getClassName(
    {
      BaseButton: true,
      sizeXs: size === 'xs',
      sizeSm: size === 'sm',
      sizeMd: size === 'md',
      sizeLg: size === 'lg',
      loading,
      fullWidth,
      fullHeight,
      autoWidth,
      active: !!active,
    },
    providedClassName
  );
  const wrapperClassName = getClassName(
    {
      wrapper: true,
      fullWidth,
      fullHeight,
      autoWidth,
    },
    providedClassName
  );
  const tooltipStyles = useMemo(() => {
    return {
      width: fullWidth ? '100%' : undefined,
      height: fullHeight ? '100%' : undefined,
      ...tooltipProps?.style,
    };
  }, [fullWidth, fullHeight, tooltipProps?.style]);

  const onBadgeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      badgeProps?.onClick?.(e);
    },
    [badgeProps]
  );

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <Tooltip title={props['aria-label'] || ''} placement='top' {...tooltipProps} style={tooltipStyles}>
        <button className={className} disabled={disabled || loading} style={providedStyle} {...restProps}>
          {startIcon && !loading && <>{startIcon}</>}
          {children}
          {endIcon && !loading && <>{endIcon}</>}
        </button>
      </Tooltip>
      {badge && (
        <Tooltip title={badgeAriaLabel || ''} placement='top' {...badgeTooltipProps}>
          <div
            {...badgeProps}
            className={getClassName(
              {
                badge: true,
                badgePrimary: effectiveBadgeVariant === 'primary',
                badgeSecondary: effectiveBadgeVariant === 'secondary',
                badgeError: effectiveBadgeVariant === 'error',
                badgeSuccess: effectiveBadgeVariant === 'success',
                badgeTransparent: effectiveBadgeVariant === 'transparent',
                badgeSizeXs: size === 'xs',
                badgeSizeSm: size === 'sm',
                badgeSizeMd: size === 'md',
                badgeSizeLg: size === 'lg',
              },
              badgeProps?.className
            )}
            onClick={onBadgeClick}
          >
            {badge}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export const BaseButton = memo(BaseButtonPrivate);
