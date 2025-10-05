import { MenuIcon } from 'lucide-react';
import { useUser } from '@hakit/core';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Header.module.css';

const getClassName = getClassNameFactory('Header', styles);

// React Component
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useUser();
  const name = user?.name || '';
  return (
    <header className={getClassName()}>
      <div className={getClassName('headerLeft')}>
        <button className={getClassName('menuButton')} onClick={onMenuClick} aria-label='Toggle sidebar'>
          <MenuIcon size={20} />
        </button>
        <div className={getClassName('brandContainer')}>Hi{name ? ` ${name}` : ''}</div>
      </div>
      {/* <div className={getClassName('headerRight')}>
        
      </div> */}
    </header>
  );
}
