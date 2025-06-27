import React from 'react';
import { Link } from '@tanstack/react-router';
import styled from '@emotion/styled';
import { FeatureText } from '@lib/page/shared/FeatureText';
import { useNavigate } from '@tanstack/react-router';

import { LayoutDashboardIcon, PackageIcon, SettingsIcon, HelpCircleIcon, LogOutIcon, XIcon } from 'lucide-react';

// Styled Components
const SidebarOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 20;
  display: ${props => props.open ? 'block' : 'none'};
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const SidebarContainer = styled.aside<{ open: boolean }>`
  position: fixed;
  z-index: 30;
  height: 100%;
  width: 256px;
  background-color: var(--color-gray-900);
  border-right: 1px solid var(--color-border);
  transform: ${props => props.open ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 200ms ease-in-out;
  
  @media (min-width: 768px) {
    position: relative;
    z-index: 0;
    transform: translateX(0);
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
`;

const SidebarTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  cursor: pointer;
`;

const CloseButton = styled.button`
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

const Navigation = styled.nav`
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const NavDivider = styled.div`
  border-top: 1px solid var(--color-border);
  margin: var(--space-4) 0;
`;

const NavItemLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  background-color: transparent;
  text-decoration: none;
  transition: all var(--transition-normal);
  
  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border);
  }
  
  &[data-status="active"] {
    color: var(--color-text-primary);
    background-color: var(--color-primary-600);
    
    &:hover {
      background-color: var(--color-primary-600);
    }
  }
`;

// React Components
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <>
      <SidebarOverlay open={open} onClick={() => setOpen(false)} />
      <SidebarContainer open={open}>
        <SidebarHeader>
          <SidebarTitle onClick={() => navigate({
            to: '/',
          })}>
            <FeatureText primary="@HAKIT" secondary="/EDITOR" />
          </SidebarTitle>
          <CloseButton onClick={() => setOpen(false)} aria-label="Close sidebar">
            <XIcon size={20} />
          </CloseButton>
        </SidebarHeader>
        <Navigation>
          <NavItem to="/me/dashboards" icon={<LayoutDashboardIcon size={18} />} label="Dashboards" />
          <NavItem to="/me/components" icon={<PackageIcon size={18} />} label="Components" />
          <NavDivider />
          <NavItem to="/me/settings" icon={<SettingsIcon size={18} />} label="Settings" />
          <NavItem to="/me/help" icon={<HelpCircleIcon size={18} />} label="Help & Support" />
          <NavItem to="/api/logout" icon={<LogOutIcon size={18} />} label="Logout" />
        </Navigation>
      </SidebarContainer>
    </>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavItemLink 
      to={to} 
      activeOptions={{ exact: false }}
    >
      {icon}
      <span>{label}</span>
    </NavItemLink>
  );
}