import styled from '@emotion/styled';
import { BaseButton, BaseButtonProps } from './BaseButton';

// Props interface for better type safety
export type PrimaryButtonProps = BaseButtonProps;

// Primary button - just override CSS variables for theming
const StyledPrimaryButton = styled(BaseButton)`
  /* Override CSS variables for primary button theming */
  --button-bg: var(--gradient-primary);
  --button-bg-hover: var(--gradient-primary);
  --button-bg-active: var(--gradient-primary);
  --button-bg-disabled: linear-gradient(135deg, var(--color-gray-500) 0%, var(--color-gray-600) 100%);
  
  --button-color: var(--color-text-primary);
  --button-color-hover: var(--color-text-primary);
  --button-color-active: var(--color-text-primary);
  --button-color-disabled: var(--color-text-primary);
  
  --button-border: none;
  --button-border-hover: none;
  --button-border-active: none;
  --button-border-disabled: none;
  
  --button-shadow: var(--shadow-primary-base);
  --button-shadow-hover: var(--shadow-primary-hover);
  --button-shadow-active: var(--shadow-primary-active);
  --button-shadow-focus: var(--shadow-primary-focus);
  
  --button-transform-hover: translateY(-1px);
  --button-transform-active: translateY(0);
  
  --button-spinner-color: rgba(255, 255, 255, 0.8);
  
  --button-overlay-bg: transparent;
  --button-overlay-bg-hover: var(--gradient-primary-hover);
  --button-overlay-bg-active: var(--gradient-primary-active);
  
  --button-opacity-disabled: 0.6;
`;

// Just export the styled component - all logic is in BaseButton
export const PrimaryButton = StyledPrimaryButton;