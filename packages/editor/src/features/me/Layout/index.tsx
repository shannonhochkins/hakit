import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './Layout.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Layout', styles);

// React Component
export function Layout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={getClassName()}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={getClassName('mainContent')}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className={getClassName('mainSection')}>{children}</div>
      </div>
    </div>
  );
}
