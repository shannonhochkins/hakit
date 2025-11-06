import React, { createElement, memo, useCallback, useMemo } from 'react';
import { Tooltip, TooltipProps } from '@components/Tooltip';
import styles from './BaseButton.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { icons, type LucideProps } from 'lucide-react';

const getClassName = getClassNameFactory('BaseButton', styles);

// Base props interface shared by all button types
export interface BaseButtonProps extends React.ComponentPropsWithRef<'div'> {
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
  startIcon?: Exclude<React.ReactNode, 'string'> | keyof typeof icons;
  /** Custom icon to display after text */
  endIcon?: Exclude<React.ReactNode, 'string'> | keyof typeof icons;
  /** when start icon is provided as a string, we can customize the props via this prop */
  startIconProps?: LucideProps;
  /** when end icon is provided as a string, we can customize the props via this prop */
  endIconProps?: LucideProps;
  /** Custom label for accessibility */
  'aria-label': string;
  /** override the tooltip props */
  tooltipProps?: Partial<TooltipProps>;
  /** Custom className to apply to the button */
  className?: string;
  /** Badge content to display on the button */
  badge?: Exclude<React.ReactNode, 'string'> | keyof typeof icons;
  /** Props to pass to the badge container div */
  badgeProps?: React.HTMLAttributes<HTMLDivElement>;
  /** props to pass to the badge icon */
  badgeIconProps?: LucideProps;
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
  /** Disabled state */
  disabled?: boolean;
  /** props to pass to the button element */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

// React component wrapper with all logic
const BaseButtonPrivate = ({
  children,
  startIcon,
  startIconProps = { size: 16 },
  endIcon,
  endIconProps = { size: 16 },
  loading,
  disabled,
  size = 'md',
  fullWidth = false,
  fullHeight = false,
  autoWidth,
  tooltipProps,
  buttonProps,
  badge,
  badgeProps,
  badgeTooltipProps,
  badgeIconProps = { size: 12 },
  variant,
  badgeVariant,
  active,
  ref,
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

  const startIconElement = useMemo(() => {
    if (typeof startIcon === 'string') {
      const iconRef = icons[startIcon as keyof typeof icons];
      return createElement(iconRef, startIconProps);
    }
    return startIcon;
  }, [startIcon, startIconProps]);

  const endIconElement = useMemo(() => {
    if (typeof endIcon === 'string') {
      const iconRef = icons[endIcon as keyof typeof icons];
      return createElement(iconRef, endIconProps);
    }
    return endIcon;
  }, [endIcon, endIconProps]);

  const badgeIconElement = useMemo(() => {
    if (typeof badge === 'string') {
      const iconRef = icons[badge as keyof typeof icons];
      return createElement(iconRef, badgeIconProps);
    }
    return badge;
  }, [badge, badgeIconProps]);

  return (
    <div className={wrapperClassName} style={wrapperStyle} ref={ref} {...restProps}>
      <Tooltip title={props['aria-label'] || ''} placement='top' {...tooltipProps} style={tooltipStyles}>
        <button className={className} disabled={disabled || loading} style={providedStyle} {...buttonProps}>
          {startIconElement && !loading && <>{startIconElement}</>}
          {children}
          {endIconElement && !loading && <>{endIconElement}</>}
        </button>
      </Tooltip>
      {badgeIconElement && (
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
            {badgeIconElement}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export const BaseButton = memo(BaseButtonPrivate);
