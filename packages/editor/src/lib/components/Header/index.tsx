import { useState } from 'react';
import { MenuIcon, XIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { PrimaryButton } from '../Button/Primary';
import { useAuthButtonState } from '@lib/hooks/useAuthButtonState';
import { FeatureText } from '../FeatureText';
import { useNavigate } from '@tanstack/react-router';

const StyledHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--color-surface-overlay);
  backdrop-filter: blur(var(--blur-lg));
  border-bottom: 1px solid var(--color-border);
`;

const Container = styled.div`
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LogoWrapper = styled.div`
  position: relative;
  font-size: var(--font-size-2xl);
  @media (max-width: 768px) {
    font-size: var(--font-size-1xl);
  }
`;

const LogoGlow = styled.div`
  position: absolute;
  inset: -4px;
  background-color: rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-full);
  filter: blur(var(--blur-lg));
  z-index: -10;
`;

const Nav = styled.nav`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

const NavList = styled.ul`
  display: flex;
  gap: var(--space-8);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li``;

const NavLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-normal);
  &:hover {
    color: var(--color-primary-400);
  }
`;

const GetStartedContainer = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  display: block;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--color-text-primary);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  display: block;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuContainer = styled.div`
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: var(--space-4);
`;

const MobileNavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MobileNavItem = styled.li``;

const MobileNavLink = styled.a`
  display: block;
  padding: var(--space-2) 0;
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--color-primary-400);
  }
`;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { buttonState, isLoading } = useAuthButtonState();

  const handleAuthButtonClick = () => {
    if (buttonState.type === 'dashboard') {      
      navigate({
        to: "/me",
        replace: true,
      })
    } else {
      // For internal routes, use client-side navigation
      window.location.href = '/api/login';
    }
  };
   
  return (
    <StyledHeader>
      <Container>
        <LogoContainer>
          <LogoWrapper>
            <FeatureText primary="@HAKIT" secondary="/EDITOR" />
            <LogoGlow />
          </LogoWrapper>
        </LogoContainer>
        
        <Nav>
          <NavList>
            <NavItem>
              <NavLink href="#features">Features</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#demo">Demo</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#benefits">Benefits</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#pricing">Pricing</NavLink>
            </NavItem>
          </NavList>
        </Nav>
        
        <GetStartedContainer>
          <PrimaryButton 
            size="sm" 
            onClick={handleAuthButtonClick}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : buttonState.label}
          </PrimaryButton>
        </GetStartedContainer>
        
        <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </MobileMenuButton>
      </Container>
      
      {isMenuOpen && (
        <MobileMenu>
          <MobileMenuContainer>
            <MobileNavList>
              <MobileNavItem>
                <MobileNavLink href="#features">Features</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileNavLink href="#demo">Demo</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileNavLink href="#benefits">Benefits</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileNavLink href="#pricing">Pricing</MobileNavLink>
              </MobileNavItem>
              <MobileNavItem>
                <PrimaryButton 
                  size="sm" 
                  fullWidth 
                  onClick={handleAuthButtonClick}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : buttonState.label}
                </PrimaryButton>
              </MobileNavItem>
            </MobileNavList>
          </MobileMenuContainer>
        </MobileMenu>
      )}
    </StyledHeader>
  );
};