import { MenuIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { useUser } from '@hakit/core';

// Styled Components
const StyledHeader = styled.header`
  background-color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;

const MenuButton = styled.button`
  display: block;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const BrandContainer = styled.div`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
`;

// const HeaderRight = styled.div`
//   display: flex;
//   align-items: center;
// `;

// React Component
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useUser();
  const name = user?.name || '';
  return (
    <StyledHeader>
      <HeaderLeft>
        <MenuButton onClick={onMenuClick} aria-label="Toggle sidebar">
          <MenuIcon size={20} />
        </MenuButton>
        <BrandContainer>
          Hi{name ? ` ${name}` : ''}
        </BrandContainer>
      </HeaderLeft>
      {/* <HeaderRight>
        
      </HeaderRight> */}
    </StyledHeader>
  );
}