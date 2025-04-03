import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledPanel = styled.div`
  overflow-y: auto;
  background: var(--panel-background-color);
  border-right: 1px solid var(--panel-border-color);
  width: 100%;
`;

interface PanelProps {
  children: ReactNode;
}

export function Panel({ children }: PanelProps) {
  return <StyledPanel>{children}</StyledPanel>;
}
