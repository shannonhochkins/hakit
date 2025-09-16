import styled from '@emotion/styled';

export const FieldWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
  width: 100%;
  flex-wrap: nowrap;
  margin-top: var(--space-3);
  [class*='_Input-input_'] {
    background-color: var(--color-gray-950) !important;
  }
  [class*='_ObjectField_'],
  [class*='_ArrayField_'],
  [class*='_ArrayFieldItem-summary'] {
    background-color: transparent;
  }
  // nested objects
  [class*='_ObjectField_']:has([class*='_ObjectField_']) {
    border: 0;
    > fieldset {
      padding: 0;
    }
    [class*='_ObjectField_'] {
      border: 0;
    }
    .field-object:has([class*='_ObjectField_']) {
      padding: 12px 0 0 0;
      border-top: 1px solid var(--color-gray-500);
    }
  }
  [class*='_ArrayFieldItem_'] {
    margin-top: 1px;
  }
  [class*='_ArrayField-addButton_'] {
    margin-top: 1px;
    background-color: var(--color-gray-500);
  }
  [class*='_ArrayFieldItem--isExpanded'] > [class*='_ArrayFieldItem-summary'] {
    color: var(--color-gray-50);
  }
  [class*='_ArrayFieldItem-body_'] {
    background-color: var(--color-gray-800);
  }
  [class*='_Input-labelIcon_'] {
    color: currentColor;
  }
  &.collapsed {
    display: none;
  }
  > * {
    margin: 0;
    padding: 0;
    height: 100%;
  }
`;
