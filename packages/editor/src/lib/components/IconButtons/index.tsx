import styled from '@emotion/styled';

export const IconButton = styled.button`
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  color: var(--puck-color-grey-03);
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 0.25rem;
  font-family: var(--puck-font-family);
  cursor: pointer;
  transition:
    background-color var(--transition-duration) var(--easing),
    color var(--transition-duration) var(--easing);

  /* Success state */
  &.success {
    background-color: var(--success-color, #47aa33);
    color: var(--puck-color-grey-01);
    transition: none;
    pointer-events: none; /* prevent further clicks while in success state */
  }

  /* Error state */
  &.error {
    background-color: var(--error-color, #db3c3c);
    color: var(--puck-color-grey-01);
    transition: none;
    pointer-events: none; /* prevent further clicks while in error state */
  }

  /* Hide inner text if in success or error state */
  .hidden {
    visibility: hidden;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  &:hover,
  &:active {
    &:not(:disabled) {
      color: var(--puck-color-grey-01);
      &:not(.disable-bg-hover) {
        background-color: var(--puck-color-grey-04);
      }
    }
  }
`;
