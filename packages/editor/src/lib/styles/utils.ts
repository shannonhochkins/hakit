import { css } from '@emotion/react';

/**
 * Common CSS mixins and utilities for the HA KIT design system
 */

// Flexbox utilities
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

// Text utilities
export const textGradient = css`
  background: var(--gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`;

export const textTruncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Focus utilities
export const focusRing = css`
  &:focus-visible {
    outline: none;
    box-shadow: var(--shadow-primary-focus);
  }
`;

// Animation utilities
export const fadeIn = css`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const slideIn = css`
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

// Responsive utilities
export const hideOnMobile = css`
  @media (max-width: 767px) {
    display: none;
  }
`;

export const hideOnDesktop = css`
  @media (min-width: 768px) {
    display: none;
  }
`;

// Interactive utilities
export const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${focusRing}
`;

export const cardBase = css`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
`;

// Accessibility utilities
export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Hover utilities
export const hoverLift = css`
  transition: transform var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
  }
`;

// Glassmorphism effect
export const glassEffect = css`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--blur-lg));
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Gradient backgrounds
export const gradientBackground = css`
  background: var(--gradient-primary);
`;

export const gradientBackgroundHover = css`
  background: var(--gradient-primary-hover);
`;

// Container utilities
export const containerBase = css`
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
`;

// Loading state
export const loadingSpinner = css`
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    margin: auto;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Scroll utilities
export const customScrollbar = css`
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-600) var(--color-gray-800);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-gray-800);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-gray-600);
    border-radius: var(--radius-sm);
    
    &:hover {
      background: var(--color-gray-500);
    }
  }
`;

// Media query breakpoints
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1200px)',
} as const;

// Helper function for responsive styles
export const responsive = {
  sm: (styles: any) => css`
    @media ${breakpoints.sm} {
      ${styles}
    }
  `,
  md: (styles: any) => css`
    @media ${breakpoints.md} {
      ${styles}
    }
  `,
  lg: (styles: any) => css`
    @media ${breakpoints.lg} {
      ${styles}
    }
  `,
  xl: (styles: any) => css`
    @media ${breakpoints.xl} {
      ${styles}
    }
  `,
};
