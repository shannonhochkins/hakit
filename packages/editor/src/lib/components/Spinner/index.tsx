import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';


interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string;
  absolute?: boolean;
  dark?: boolean;
}

const spin = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`

const SpinnerContainer = styled.div<SpinnerProps>`
  width: ${props => props.size};
  height: ${props => props.size};
  ${props => props.absolute ? `
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  ` : `
    position: relative;
    margin: auto;
  `}
  span {
    display: block;
    width: ${props => props.size};
    height: ${props => props.size};
    border: 0.15rem solid transparent;
    border-radius: 50%;
    border-right-color: ${props => props.dark ? 'var(--puck-color-grey-12)' : 'var(--puck-color-grey-1)'};
    animation: ${spin} 0.8s linear infinite;
  }
`;


export function Spinner({
  size = '2rem',
  absolute = false,
  dark = false,
  ...rest
}: SpinnerProps) {

  return (
    <SpinnerContainer size={size} absolute={absolute} dark={dark} {...rest}>
      <span></span>
    </SpinnerContainer>
  );
}