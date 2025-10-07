import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { FeatureText } from '@components/FeatureText';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Sidebar.module.css';

const getClassName = getClassNameFactory('Sidebar', styles);

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
import { Row } from '@components/Layout';
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
      <div
        className={getClassName({
          overlay: true,
          'overlay--open': open,
        })}
        onClick={() => setOpen(false)}
      />
      <aside
        className={getClassName({
          container: true,
          'container--open': open,
        })}
      >
        <div className={getClassName('header')}>
          <h2
            className={getClassName('title')}
            onClick={() =>
              navigate({
                to: '/',
              })
            }
          >
            <FeatureText primary='@HAKIT' secondary='/EDITOR' />
          </h2>
          <button className={getClassName('closeButton')} onClick={() => setOpen(false)} aria-label='Close sidebar'>
            <XIcon size={20} />
          </button>
        </div>
        <nav className={getClassName('navigation')}>
          {navigationStructure.map((item, index) => (
            <React.Fragment key={item.to}>
              {index === navigationStructure.length - 3 && <div className={getClassName('navDivider')} />}
              <NavGroup item={item} isExpanded={expandedGroups.includes(item.to)} onToggle={() => item.subItems && toggleGroup(item.to)} />
            </React.Fragment>
          ))}
        </nav>
      </aside>
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
      <Link
        to={item.to as keyof FileRoutesByTo}
        search={item.search as unknown as true}
        activeOptions={{ exact: false }}
        className={getClassName('navItemLink')}
      >
        <Row justifyContent='center'>
          {item.icon}
          <span>{item.label}</span>
        </Row>
        <button
          className={getClassName('chevronButton')}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          type='button'
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
        >
          <div
            className={getClassName({
              chevronIcon: true,
              'chevronIcon--isExpanded': isExpanded,
            })}
          >
            <ChevronRightIcon size={14} />
          </div>
        </button>
      </Link>
      <div
        className={getClassName({
          subNavContainer: true,
          'subNavContainer--isExpanded': isExpanded,
        })}
      >
        {item.subItems.map(subItem => (
          <div key={subItem.to + subItem.label} className={getClassName('subNavItem')}>
            <div className={getClassName('treeSpace')} />
            <Link
              to={subItem.to as keyof FileRoutesByTo}
              search={subItem.search as unknown as true}
              activeOptions={{ exact: true }}
              className={getClassName('subNavItemLink')}
            >
              {subItem.icon}
              <span>{subItem.label}</span>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

function NavItem({ to, icon, label, search }: NavItemProps) {
  return (
    <Link
      to={to as keyof FileRoutesByTo}
      search={search as unknown as true}
      activeOptions={{ exact: true }}
      className={getClassName('navItemLink')}
    >
      <Row>
        {icon}
        <span>{label}</span>
      </Row>
    </Link>
  );
}
