import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import styled from '@emotion/styled';
import { FeatureText } from '@components/FeatureText';

import {
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  XIcon,
  ChevronRightIcon,
  SearchIcon,
  Component,
  PlusIcon,
  AlertTriangle,
} from 'lucide-react';
import { Row } from '@hakit/components';
import { FileRoutesByTo } from '../../../../routeTree.gen';

type RouteNames = keyof FileRoutesByTo | '/api/logout';

// Navigation structure definition
interface NavSubItem {
  to: RouteNames;
  search?: Record<string, unknown>;
  icon: React.ReactNode;
  label: string;
}

interface NavGroupItem {
  to: RouteNames;
  search?: Record<string, string>;
  icon: React.ReactNode;
  label: string;
  subItems?: NavSubItem[];
}

const navigationStructure: NavGroupItem[] = [
  {
    to: '/me/dashboards',
    icon: <LayoutDashboardIcon size={18} />,
    label: 'Dashboards',
  },
  {
    to: '/me/repositories',
    icon: <PackageIcon size={18} />,
    label: 'Repositories',
    subItems: [
      {
        to: '/me/repositories',
        icon: <Component size={16} />,
        label: 'Installed',
      },
      {
        to: '/me/repositories/explore',
        icon: <SearchIcon size={16} />,
        label: 'Explore',
      },
      {
        to: '/me/repositories/install',
        icon: <PlusIcon size={16} />,
        label: 'Install',
      },
    ],
  },
  {
    to: '/me/issues',
    icon: <AlertTriangle size={18} />,
    label: 'Issues',
    subItems: [
      { to: '/me/issues', icon: <SearchIcon size={16} />, label: 'Issues List' },
      { to: '/me/issues', search: { modal: 'new' }, icon: <PlusIcon size={16} />, label: 'New Issue' },
    ],
  },
  {
    to: '/me/settings',
    icon: <SettingsIcon size={18} />,
    label: 'Settings',
  },
  {
    to: '/me/help',
    icon: <HelpCircleIcon size={18} />,
    label: 'Help & Support',
  },
  {
    to: '/api/logout',
    icon: <LogOutIcon size={18} />,
    label: 'Logout',
  },
];

// Styled Components
const SidebarOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 20;
  display: ${props => (props.open ? 'block' : 'none')};

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
  transform: ${props => (props.open ? 'translateX(0)' : 'translateX(-100%)')};
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
  flex-shrink: 0;
  flex-grow: 0;
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
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  background-color: transparent;
  text-decoration: none;
  transition: all var(--transition-normal);

  span {
    margin-left: var(--space-2);
  }

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border);
  }

  &[data-status='active'] {
    color: var(--color-text-primary);
    background-color: var(--color-primary-600);

    &:hover {
      background-color: var(--color-primary-600);
    }
  }
`;

const ChevronIcon = styled.div<{ isExpanded: boolean }>`
  transition: transform var(--transition-normal);
  transform: ${props => (props.isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)')};
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChevronButton = styled.button`
  background: none;
  border: none;
  padding: var(--space-1);
  margin: -var(--space-1);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-normal);

  &:hover {
    background-color: var(--color-border);
  }
`;

const SubNavContainer = styled.div<{ isExpanded: boolean }>`
  overflow: hidden;
  transition: all var(--transition-normal);
  max-height: ${props => (props.isExpanded ? '200px' : '0')};
  opacity: ${props => (props.isExpanded ? '1' : '0')};
`;

const SubNavItem = styled.div`
  position: relative;
  margin-left: var(--space-6);
`;

const TreeSpace = styled.div`
  position: absolute;
  left: calc(var(--space-3) * -1);
  top: calc(var(--space-1) * -1);
  bottom: var(--space-3);
  width: var(--space-3);
  border-left: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-md);
  background-color: transparent;
`;

const SubNavItemLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  margin: var(--space-2) 0;
  margin-left: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  background-color: transparent;
  text-decoration: none;
  transition: all var(--transition-normal);
  font-size: var(--font-size-sm);

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border);
  }

  &[data-status='active'] {
    color: var(--color-text-primary);
    background-color: var(--color-primary-900);

    &:hover {
      background-color: var(--color-primary-600);
    }
  }
`;

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const navigate = useNavigate();

  // Auto-expand groups that have sub-items by default
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() =>
    navigationStructure.filter(item => item.subItems && item.subItems.length > 0).map(item => item.to)
  );

  const toggleGroup = (groupTo: string) => {
    setExpandedGroups(prev => (prev.includes(groupTo) ? prev.filter(item => item !== groupTo) : [...prev, groupTo]));
  };

  return (
    <>
      <SidebarOverlay open={open} onClick={() => setOpen(false)} />
      <SidebarContainer open={open}>
        <SidebarHeader>
          <SidebarTitle
            onClick={() =>
              navigate({
                to: '/',
              })
            }
          >
            <FeatureText primary='@HAKIT' secondary='/EDITOR' />
          </SidebarTitle>
          <CloseButton onClick={() => setOpen(false)} aria-label='Close sidebar'>
            <XIcon size={20} />
          </CloseButton>
        </SidebarHeader>
        <Navigation>
          {navigationStructure.map((item, index) => (
            <React.Fragment key={item.to}>
              {index === navigationStructure.length - 3 && <NavDivider />}
              <NavGroup item={item} isExpanded={expandedGroups.includes(item.to)} onToggle={() => item.subItems && toggleGroup(item.to)} />
            </React.Fragment>
          ))}
        </Navigation>
      </SidebarContainer>
    </>
  );
}

interface NavItemProps {
  to: RouteNames;
  icon: React.ReactNode;
  label: string;
  search?: Record<string, unknown>;
}

interface NavGroupProps {
  item: NavGroupItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavGroup({ item, isExpanded, onToggle }: NavGroupProps) {
  if (!item.subItems || item.subItems.length === 0) {
    return <NavItem to={item.to} icon={item.icon} label={item.label} />;
  }
  return (
    <>
      <NavItemLink to={item.to} search={item.search as unknown as true} activeOptions={{ exact: false }}>
        <Row justifyContent='center'>
          {item.icon}
          <span>{item.label}</span>
        </Row>
        <ChevronButton
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          type='button'
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
        >
          <ChevronIcon isExpanded={isExpanded}>
            <ChevronRightIcon size={14} />
          </ChevronIcon>
        </ChevronButton>
      </NavItemLink>
      <SubNavContainer isExpanded={isExpanded}>
        {item.subItems.map(subItem => (
          <SubNavItem key={subItem.to + subItem.label}>
            <TreeSpace />
            <SubNavItemLink to={subItem.to} search={subItem.search as unknown as true} activeOptions={{ exact: true }}>
              {subItem.icon}
              <span>{subItem.label}</span>
            </SubNavItemLink>
          </SubNavItem>
        ))}
      </SubNavContainer>
    </>
  );
}

function NavItem({ to, icon, label, search }: NavItemProps) {
  return (
    <NavItemLink to={to} search={search as unknown as true} activeOptions={{ exact: true }}>
      <Row>
        {icon}
        <span>{label}</span>
      </Row>
    </NavItemLink>
  );
}
