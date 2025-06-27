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
    background-color var(--transition-normal),
    color var(--transition-normal);

  /* Success state */
  &.success {
    background-color: var(--color-success-500);
    color: var(--puck-color-grey-01);
    transition: none;
    pointer-events: none; /* prevent further clicks while in success state */
  }

  /* Error state */
  &.error {
    background-color: var(--color-error-500);
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
