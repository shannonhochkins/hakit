import styled from '@emotion/styled';
import { GripVertical } from 'lucide-react';
import React from 'react';

interface BaseHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: 'vertical' | 'horizontal';
  children?: React.ReactNode;
  position?: string;
}

const ResizeHandleContainer = styled.div`
  inset: 0;
  padding: 0;
  position: absolute;
  z-index: var(--z-modal, 500);
  overflow: visible;
  cursor: ew-resize;
`;

const DefaultHandle = styled(GripVertical)`
  position: absolute;
  opacity: 0.5;
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background-color var(--transition-normal);

  /* Group hover and active states */
  ${ResizeHandleContainer}:hover & {
    color: var(--color-primary-500);
  }

  ${ResizeHandleContainer}:active & {
    color: var(--color-secondary-400);
  }
`;

export const ResizeHandleIcon = ({ direction, position, children, ...rest }: BaseHandleProps) => {
  return (
    <ResizeHandleContainer data-testid={`${direction}ResizeHandle-${position}`} {...rest}>
      {children ? (
        // Render custom handle content if provided
        children
      ) : (
        // Default handle content
        <DefaultHandle size={16} />
      )}
    </ResizeHandleContainer>
  );
};
