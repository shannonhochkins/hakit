import styled from '@emotion/styled';

const StyledFormControlGroup = styled.div`
  position: relative;
  background-color: var(--ha-S100);
  padding: 0.5rem;
  border-radius: 0.5rem;
  width: calc(100% - 0.5rem);
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
}
export function FormControlGroup({
  label,
  children,
  description,
  ...rest
}: FormControlGroupProps) {
  return (
    <StyledFormControlGroup {...rest}>
      <label>{label}</label>
      {children}
      {description && <span>{description}</span>}
    </StyledFormControlGroup>
  );
}