import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

type Props = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export const NavigationSidebarContainer: React.FC<Props> = ({ open, onClose, children }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  return createPortal(
    <>
      <SidebarContainer ref={sidebarRef} visible={open}>
        {children}
      </SidebarContainer>
      <Overlay visible={open} onClick={onClose}/>
    </>,
    document.body
  );
};

// Animations
const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
`;

// Styled components
const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: calc(var(--ha-modal-z-index, 10) - 1);
  backdrop-filter: blur(0.25em) brightness(0.75);
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  cursor: pointer;
`;

const SidebarContainer = styled.div<{ visible: boolean }>`
  width: 400px;
  height: 100%;
  background: var(--puck-color-grey-12);
  color: white;
  position: absolute;
  left: 0;
  top: 0;
  z-index: calc(var(--ha-modal-z-index, 10));
  padding: var(--puck-space-px);
  animation: ${({ visible }) => (visible ? slideIn : slideOut)} 0.3s ease forwards;
`;