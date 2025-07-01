import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { BaseButton, BaseButtonProps } from './BaseButton';

// Props interface for better type safety
export interface PrimaryButtonProps extends BaseButtonProps {
  /** Color variant of the button */
  variant?: 'primary' | 'success' | 'error';
}

// Helper function to get variant styles
const getVariantStyles = (variant: 'primary' | 'success' | 'error' = 'primary') => {
  switch (variant) {
    case 'success':
      return css`
        --button-bg: linear-gradient(135deg, var(--color-success-500) 0%, var(--color-success-600) 100%);
        --button-bg-hover: linear-gradient(135deg, var(--color-success-500) 0%, var(--color-success-600) 100%);
        --button-bg-active: linear-gradient(135deg, var(--color-success-500) 0%, var(--color-success-600) 100%);
        --button-bg-disabled: linear-gradient(135deg, var(--color-gray-500) 0%, var(--color-gray-600) 100%);

        --button-shadow: var(--shadow-success-base);
        --button-shadow-hover: var(--shadow-success-hover);
        --button-shadow-active: var(--shadow-success-active);
        --button-shadow-focus: var(--shadow-success-focus);

        --button-overlay-bg-hover: linear-gradient(135deg, var(--color-success-600) 0%, var(--color-success-700) 100%);
        --button-overlay-bg-active: linear-gradient(135deg, var(--color-success-700) 0%, var(--color-success-800) 100%);
      `;
    case 'error':
      return css`
        --button-bg: linear-gradient(135deg, var(--color-error-500) 0%, var(--color-error-600) 100%);
        --button-bg-hover: linear-gradient(135deg, var(--color-error-500) 0%, var(--color-error-600) 100%);
        --button-bg-active: linear-gradient(135deg, var(--color-error-500) 0%, var(--color-error-600) 100%);
        --button-bg-disabled: linear-gradient(135deg, var(--color-gray-500) 0%, var(--color-gray-600) 100%);

        --button-shadow: var(--shadow-error-base);
        --button-shadow-hover: var(--shadow-error-hover);
        --button-shadow-active: var(--shadow-error-active);
        --button-shadow-focus: var(--shadow-error-focus);

        --button-overlay-bg-hover: linear-gradient(135deg, var(--color-error-600) 0%, var(--color-error-700) 100%);
        --button-overlay-bg-active: linear-gradient(135deg, var(--color-error-700) 0%, var(--color-error-800) 100%);
      `;
    default: // primary
      return css`
        --button-bg: var(--gradient-primary);
        --button-bg-hover: var(--gradient-primary);
        --button-bg-active: var(--gradient-primary);
        --button-bg-disabled: linear-gradient(135deg, var(--color-gray-500) 0%, var(--color-gray-600) 100%);

        --button-shadow: var(--shadow-primary-base);
        --button-shadow-hover: var(--shadow-primary-hover);
        --button-shadow-active: var(--shadow-primary-active);
        --button-shadow-focus: var(--shadow-primary-focus);

        --button-overlay-bg-hover: var(--gradient-primary-hover);
        --button-overlay-bg-active: var(--gradient-primary-active);
      `;
  }
};

// Primary button - just override CSS variables for theming
const StyledPrimaryButton = styled(BaseButton)<{ variant?: 'primary' | 'success' | 'error' }>`
  /* Override CSS variables for primary button theming */
  --button-color: var(--color-text-primary);
  --button-color-hover: var(--color-text-primary);
  --button-color-active: var(--color-text-primary);
  --button-color-disabled: var(--color-text-primary);

  --button-border: none;
  --button-border-hover: none;
  --button-border-active: none;
  --button-border-disabled: none;

  --button-transform-hover: translateY(-1px);
  --button-transform-active: translateY(0);

  --button-spinner-color: rgba(255, 255, 255, 0.8);

  --button-overlay-bg: transparent;

  --button-opacity-disabled: 0.6;

  /* Apply variant-specific styles */
  ${props => getVariantStyles(props.variant)}
`;

// Export component with variant support
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ variant = 'primary', ...props }) => {
  return <StyledPrimaryButton variant={variant} {...props} />;
};
