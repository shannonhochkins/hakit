import styled from '@emotion/styled';

export const Fieldset = styled.fieldset`
  outline: none;
  border: none;
  padding: 0;
  padding-top: var(--space-3);
  margin: 0;
  color: var(--color-text-muted);
  background: transparent;
  transition: padding 0.2s ease-in-out;
  &.collapsible {
    cursor: pointer;
  }
  &.bp-mode-enabled {
    position: relative;
    padding-left: var(--space-3);
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: -4px;
      width: 4px;
      height: 100%;
      background-color: var(--color-primary-500);
    }
  }
`;
