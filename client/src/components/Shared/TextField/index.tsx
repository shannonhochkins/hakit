import { ChangeEvent, ReactNode } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const TextFieldWrapper = styled.div`
  position: relative;
  width: 100%;
`;
const Label = styled.label`
  position: absolute;
  font-size: 1rem;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--ha-S100);
  color: var(--ha-S400-contrast);
  padding: 0 0.3rem;
  margin: 0 0.5rem;
  transition: .1s ease-out;
  transform-origin: left top;
  pointer-events: none;
  border-radius: 0.5rem;
`;
const Input = styled.input`
  font-size: 1rem;
  outline: none;
  border: 1px solid var(--ha-S400);
  border-radius: 0.5rem;  
  padding: 1rem 0.7rem;
  color: var(--ha-S300-contrast);
  background-color: var(--ha-S100);
  transition: 0.1s ease-out;
  width: 100%;
  &:focus {
    border-color: var(--ha-S500);
    + label {
      color: var(--ha-S100-contrast);
      top: 0;
      transform: translateY(-50%) scale(.9);
    }
  }
  &:not(:placeholder-shown) + label {
    top: 0;
    transform: translateY(-50%) scale(.9);
  }
`;

interface TextFieldProps extends Omit<React.HTMLProps<HTMLInputElement>, 'as' | 'label'> {
  label: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function TextField({
  type = 'text',
  label,
  onChange,
  style,
  ...rest
} : TextFieldProps) {
  return (<Container className="container" style={style ?? {}}>
    <TextFieldWrapper className="material-textfield">
      <Input type={type} onChange={onChange} {...rest} />
      <Label>{label}</Label>
    </TextFieldWrapper>
  </Container>);
}
