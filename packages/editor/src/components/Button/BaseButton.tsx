import React from 'react';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import { ButtonHTMLAttributes } from 'react';
import { Tooltip, TooltipProps } from '@components/Tooltip';

// Base props interface shared by all button types
export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Size variant of the button */
  size?: 'sm' | 'md' | 'lg';
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
}

const spin = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

// Base button with CSS variables for theming
const StyledBaseButton = styled.button<BaseButtonProps>`
  /* CSS Variables for theming - can be overridden by variants */
  --button-bg: var(--color-surface-elevated);
  --button-bg-hover: var(--color-border-subtle);
  --button-bg-active: var(--color-gray-700);
  --button-bg-disabled: var(--color-gray-800);
  --button-color: var(--color-text-primary);
  --button-color-hover: var(--color-text-primary);
  --button-color-active: var(--color-text-primary);
  --button-color-disabled: var(--color-text-primary);
  --button-border: 1px solid var(--color-border);
  --button-border-hover: 1px solid var(--color-gray-600);
  --button-border-active: 1px solid var(--color-gray-600);
  --button-border-disabled: 1px solid var(--color-gray-700);
  --button-shadow: none;
  --button-shadow-hover: none;
  --button-shadow-active: none;
  --button-shadow-focus: var(--shadow-primary-focus);
  --button-transform-hover: translateY(-1px);
  --button-transform-active: translateY(0);
  --button-spinner-color: var(--color-text-primary);
  --button-overlay-bg: transparent;
  --button-overlay-bg-hover: transparent;
  --button-overlay-bg-active: transparent;
  --button-opacity-disabled: 0.6;

  /* Base layout and interaction */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;

  /* Typography */
  font-family: inherit;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
  text-decoration: none;
  white-space: nowrap;

  /* Layout defaults */
  min-width: 120px;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-xl);
  overflow: hidden;

  /* Apply CSS variables */
  background: var(--button-bg);
  color: var(--button-color);
  border: var(--button-border);
  box-shadow: var(--button-shadow);

  /* Performance optimizations */
  transform: translateZ(0);
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  transition: all var(--transition-fast);

  /* Overlay for gradients and effects */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--button-overlay-bg);
    opacity: 0;
    transition: all var(--transition-fast);
    z-index: -1;
    pointer-events: none;
    border-radius: inherit;
  }

  /* Ensure content is above overlay */
  > * {
    position: relative;
    z-index: 1;
  }

  /* Hover state */
  &:hover:not(:disabled) {
    background: var(--button-bg-hover);
    color: var(--button-color-hover);
    border: var(--button-border-hover);
    box-shadow: var(--button-shadow-hover);
    transform: var(--button-transform-hover);

    &::before {
      background: var(--button-overlay-bg-hover);
      opacity: 1;
    }
  }

  /* Focus state for accessibility */
  &:focus:not(:disabled) {
    outline: none;
    box-shadow: var(--button-shadow), var(--button-shadow-focus);

    &::before {
      background: var(--button-overlay-bg-hover);
      opacity: 1;
    }
  }

  /* Focus-visible for keyboard navigation */
  &:focus-visible:not(:disabled) {
    outline: none;
    box-shadow: var(--button-shadow), var(--button-shadow-focus);

    &::before {
      background: var(--button-overlay-bg-hover);
      opacity: 1;
    }
  }

  /* Active state */
  &:active:not(:disabled) {
    background: var(--button-bg-active);
    color: var(--button-color-active);
    border: var(--button-border-active);
    box-shadow: var(--button-shadow-active);
    transform: var(--button-transform-active);

    &::before {
      background: var(--button-overlay-bg-active);
      opacity: 1;
    }
  }

  /* Disabled state */
  &:disabled {
    background: var(--button-bg-disabled);
    color: var(--button-color-disabled);
    border: var(--button-border-disabled);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: var(--button-opacity-disabled);
  }

  /* Loading state */
  ${props =>
    props.loading &&
    css`
      cursor: default;
      pointer-events: none;
      color: transparent !important;

      /* Prevent background color change when loading */
      &:disabled {
        color: transparent !important;
        background: var(--button-bg) !important;
        border: var(--button-border) !important;
        opacity: 1 !important;
        cursor: default !important;
      }

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        border: 2px solid transparent;
        border-top-color: var(--button-spinner-color);
        border-radius: 50%;
        z-index: 2;
        /* Animation handles both centering and rotation */
        animation: ${spin} 1s linear infinite;
      }
    `}

  /* Size variants */
  ${props =>
    props.size === 'sm' &&
    css`
      min-width: 80px;
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
    `}

  ${props =>
    props.size === 'md' &&
    css`
      min-width: 100px;
      padding: var(--space-2) var(--space-5);
      font-size: var(--font-size-base);
    `}

  ${props =>
    props.size === 'lg' &&
    css`
      min-width: 160px;
      padding: var(--space-4) var(--space-8);
      font-size: var(--font-size-lg);
    `}

  /* Full width variant */
  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
      min-width: auto;
    `}
  ${props =>
    props.fullHeight &&
    css`
      height: 100%;
      min-height: auto;
    `}

  ${props =>
    props.autoWidth &&
    css`
      width: auto;
      min-width: 0;
    `}

  svg {
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid currentColor;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

// React component wrapper with all logic
export const BaseButton: React.FC<BaseButtonProps> = ({
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
  ...props
}) => {
  return (
    <Tooltip
      title={props['aria-label'] || ''}
      placement='top'
      {...tooltipProps}
      style={{
        width: fullWidth ? '100%' : undefined,
        height: fullHeight ? '100%' : undefined,
      }}
    >
      <StyledBaseButton
        size={size}
        loading={loading}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        disabled={disabled || loading}
        autoWidth={autoWidth}
        {...props}
      >
        {startIcon && !loading && <>{startIcon}</>}
        {children}
        {endIcon && !loading && <>{endIcon}</>}
      </StyledBaseButton>
    </Tooltip>
  );
};
