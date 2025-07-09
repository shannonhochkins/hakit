import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { ButtonHTMLAttributes } from 'react';
import { focusRing } from '@lib/styles/utils';
import { Tooltip, TooltipProps } from '@lib/components/Tooltip';

// Props interface for the FAB
export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display in the center of the FAB */
  icon: React.ReactNode;
  /** Size variant of the FAB */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Color variant of the FAB */
  variant?: 'primary' | 'secondary' | 'transparent';
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

const getFabSize = (size: 'xs' | 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'xs':
      return css`
        width: 32px;
        height: 32px;
        font-size: var(--font-size-xs);
      `;
    case 'sm':
      return css`
        width: 40px;
        height: 40px;
        font-size: var(--font-size-sm);
      `;
    case 'lg':
      return css`
        width: 64px;
        height: 64px;
        font-size: var(--font-size-xl);
      `;
    default:
      return css`
        width: 56px;
        height: 56px;
        font-size: var(--font-size-lg);
      `;
  }
};

const getFabPosition = (position: FabProps['position']) => {
  if (position === 'relative') return '';

  const baseFixed = css`
    position: fixed;
    z-index: var(--z-fixed);
  `;

  switch (position) {
    case 'bottom-right':
      return css`
        ${baseFixed}
        bottom: var(--space-6);
        right: var(--space-6);
      `;
    case 'bottom-left':
      return css`
        ${baseFixed}
        bottom: var(--space-6);
        left: var(--space-6);
      `;
    case 'top-right':
      return css`
        ${baseFixed}
        top: var(--space-6);
        right: var(--space-6);
      `;
    case 'top-left':
      return css`
        ${baseFixed}
        top: var(--space-6);
        left: var(--space-6);
      `;
    default:
      return css`
        ${baseFixed}
        bottom: var(--space-6);
        right: var(--space-6);
      `;
  }
};

const getFabVariant = (variant: 'primary' | 'secondary' | 'transparent') => {
  if (variant === 'secondary') {
    return css`
      background: var(--color-surface-elevated);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);

      &::before {
        background: var(--color-border);
      }

      &:hover:not(:disabled) {
        border-color: var(--color-gray-600);
        box-shadow: var(--shadow-xl);
      }

      &:active:not(:disabled) {
        &::before {
          background: var(--color-gray-500);
          color: var(--color-text-primary);
        }
      }
      &.active {
        background-color: var(--color-gray-500);
        color: var(--color-text-primary);
      }
    `;
  }

  if (variant === 'transparent') {
    return css`
      background: transparent;
      color: var(--color-text-muted);
      border: none;
      box-shadow: none;

      &::before {
        background: rgba(255, 255, 255, 0.1);
      }

      &:hover:not(:disabled) {
        box-shadow: var(--shadow-lg);
      }

      &:active:not(:disabled) {
        &::before {
          background: rgba(255, 255, 255, 0.2);
        }
      }
      &.active {
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text-primary);
      }
    `;
  }

  return css`
    background: var(--gradient-primary);
    color: var(--color-text-primary);
    border: none;
    box-shadow: var(--shadow-primary-base), var(--shadow-lg);

    &::before {
      background: var(--gradient-primary-hover);
    }

    &:hover:not(:disabled) {
      box-shadow: var(--shadow-primary-hover), var(--shadow-xl);
    }

    &:active:not(:disabled) {
      &::before {
        background: var(--gradient-primary-active);
      }
    }
    &.active {
      background-color: var(--color-primary-600);
      color: var(--color-text-primary);
    }
  `;
};

const StyledFab = styled.button<Omit<FabProps, 'icon'>>`
  /* Base styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.borderRadius || '50%'};
  cursor: pointer;
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  overflow: hidden;

  /* Performance optimizations */
  transform: translateZ(0);
  will-change: transform, box-shadow;
  backface-visibility: hidden;

  /* Hover overlay for smooth transitions */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity var(--transition-fast);
    z-index: -1;
  }

  /* Smooth transitions */
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);

  /* Hover state */
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);

    &::before {
      opacity: 1;
    }
  }

  /* Focus state */
  ${focusRing}

  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(0) scale(1);

    &::before {
      opacity: 1;
    }
  }

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: var(--shadow-md);

    &:hover {
      transform: none;
    }
  }

  /* Loading state */
  ${props =>
    props.loading &&
    css`
      cursor: default;
      pointer-events: none;

      &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    `}

  /* Pulse animation */
  ${props =>
    props.pulse &&
    css`
      animation: pulse 2s infinite;

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
    `}

  /* Size variants */
  ${props => getFabSize(props.size || 'md')}
  
  /* Position variants */
  ${props => getFabPosition(props.position)}
  
  /* Color variants */
  ${props => getFabVariant(props.variant || 'primary')}

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid currentColor;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
    animation: none !important;

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      transform: none;
    }
  }

  /* Loading animation */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// React component wrapper
export const Fab: React.FC<FabProps> = ({
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
  ...props
}) => {
  return (
    <Tooltip title={props['aria-label'] || ''} placement='top' {...tooltipProps}>
      <StyledFab
        size={size}
        variant={variant}
        position={position}
        pulse={pulse && !loading}
        loading={loading}
        disabled={disabled || loading}
        active={active}
        className={`${className || ''} ${active ? 'active' : ''}`}
        {...props}
      >
        {loading ? null : icon}
        {children}
      </StyledFab>
    </Tooltip>
  );
};
