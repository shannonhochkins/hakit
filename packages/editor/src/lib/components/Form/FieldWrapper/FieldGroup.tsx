import styled from '@emotion/styled';

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  &.full-width {
    width: 100%;
  }
`;

export const ErrorMessage = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-error-500);
  margin: 0;
  margin-top: var(--space-1);
`;
