import React from 'react';
import { ButtonHTMLAttributes } from 'react';
import { Tooltip, TooltipProps } from '@components/Tooltip';
import styles from './BaseButton.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('BaseButton', styles);

// Base props interface shared by all button types
export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
}

// React component wrapper with all logic
export const BaseButton = ({
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
  ...props
}: BaseButtonProps) => {
  const { className: providedClassName, style: providedStyle, 'badge-aria-label': badgeAriaLabel, ...restProps } = props;

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
    },
    providedClassName
  );
  return (
    <div className={getClassName('BaseButton-wrapper')}>
      <Tooltip
        title={props['aria-label'] || ''}
        placement='top'
        {...tooltipProps}
        style={{
          width: fullWidth ? '100%' : undefined,
          height: fullHeight ? '100%' : undefined,
          ...tooltipProps?.style,
        }}
      >
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
            onClick={e => {
              e.stopPropagation();
              badgeProps?.onClick?.(e);
            }}
          >
            {badge}
          </div>
        </Tooltip>
      )}
    </div>
  );
};
