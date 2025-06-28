import styled from '@emotion/styled';
import type { ReactNode } from 'react';


const GradientText = styled.span`
  font-size: inherit;
  font-weight: var(--font-weight-bold);
  background: var(--gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  &.secondary {
    background: var(--gradient-text-secondary);
    background-clip: text;
    -webkit-background-clip: text;
  }
`;

interface FeatureTextProps {
  primary?: ReactNode;
  secondary?: ReactNode;
  className?: string;
}

export function FeatureText({ primary, secondary, className }: FeatureTextProps) {
  return <>
    {primary && <GradientText className={`${className || ''} primary`}>{primary}</GradientText>}
    {secondary && <GradientText className={`${className || ''} secondary`}>{secondary}</GradientText>}
  </>
}