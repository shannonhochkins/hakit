import styled from '@emotion/styled';
import { Ripples } from '@hakit/components';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  cursor: pointer;
  height: 2rem;
  line-height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.9rem;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  vertical-align: middle;
  white-space: nowrap;
  outline: none;
  border: none;
  user-select: none;
  border-radius: 0.5rem;
  transition: all .3s ease-out;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,0.225);
  color: var(--ha-A200-contrast);
  background-color: var(--ha-A400);

  &:hover { 
    text-decoration: none;
    box-shadow: 0 4px 10px 0px rgba(0,0,0,0.225);
    background-color: var(--ha-A200);
  }
  &.secondary {
    background-color: var(--ha-300);
    color: var(--ha-300-contrast);
    &:hover {
      background-color: var(--ha-500);
    }
  }
  &.danger {
    background-color: var(--ha-alert-error-color);
    filter: brightness(0.8);
    color: var(--ha-500-contrast);
    &:hover {
      background-color: var(--ha-alert-error-color);
      filter: brightness(1);
    }
  }
`;

interface ButtonProps extends Omit<React.HTMLProps<HTMLButtonElement>, 'as' | 'type'> {
  children: React.ReactNode;
  secondary?: boolean;
  danger?: boolean;
}

export function Button({ children, secondary, disabled, danger, className, ...rest }: ButtonProps) {
  return (<Ripples
    disabled={disabled}
    borderRadius="0.5rem"
    whileTap={{ scale: disabled ? 1 : 0.9 }}
    >
      <StyledButton disabled={disabled} className={`${secondary ? 'secondary' : ''} ${danger ? 'danger' : ''} ${className}`} {...rest}>
        {children}
      </StyledButton>
  </Ripples>);
}
