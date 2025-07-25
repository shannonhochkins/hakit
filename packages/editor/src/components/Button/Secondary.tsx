import styled from '@emotion/styled';
import { BaseButton, BaseButtonProps } from './BaseButton';

// Props interface for the secondary button
export type SecondaryButtonProps = BaseButtonProps;

// Secondary button - just override CSS variables for theming
const StyledSecondaryButton = styled(BaseButton)`
  /* CSS variables are already set to secondary button defaults in BaseButton */
  /* Only override if we need different values */

  /* Secondary buttons use the default values from BaseButton:
   * --button-bg: var(--color-surface-elevated);
   * --button-bg-hover: var(--color-border-subtle);
   * --button-bg-active: var(--color-gray-700);
   * --button-bg-disabled: var(--color-gray-800);
   * --button-color: var(--color-text-primary);
   * --button-border: 1px solid var(--color-border);
   * --button-border-hover: 1px solid var(--color-gray-600);
   * --button-spinner-color: var(--color-text-primary);
   * etc.
   */
`;

// Just export the styled component - all logic is in BaseButton
export const SecondaryButton = StyledSecondaryButton;
