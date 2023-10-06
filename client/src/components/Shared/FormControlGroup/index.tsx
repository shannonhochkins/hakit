import styled from '@emotion/styled';

const StyledFormControlGroup = styled.div<{
  reverse?: boolean;
}>`
  position: relative;
  background-color: var(--ha-S100);
  padding: 1rem;
  border-radius: 0.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  ${props => props.reverse ? `justify-content: flex-end; flex-direction: row-reverse;` : ''}
  gap: 0.5rem;
  label {
    display:block;
  }
  span {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    display: block;
    font-size: 0.75rem;
    color: var(--ha-S400-contrast);
  }
`;
interface FormControlGroupProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  reverse?: boolean;
}
export function FormControlGroup({
  label,
  children,
  description,
  reverse,
  ...rest
}: FormControlGroupProps) {
  return (
    <StyledFormControlGroup reverse={reverse} {...rest}>
      <label>{label}</label>
      {children}
      {description && <span>{description}</span>}
    </StyledFormControlGroup>
  );
}