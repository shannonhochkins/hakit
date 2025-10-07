import { useState } from 'react';
import { MenuIcon, XIcon } from 'lucide-react';
import styles from './HomeHeader.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const getClassName = getClassNameFactory('HomeHeader', styles);
import { PrimaryButton } from '@components/Button/Primary';
import { useAuthButtonState } from '@hooks/useAuthButtonState';
import { FeatureText } from '@components/FeatureText';
import { useNavigate } from '@tanstack/react-router';

// using css modules

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { buttonState, isLoading } = useAuthButtonState();

  const handleAuthButtonClick = () => {
    if (buttonState.type === 'dashboard') {
      navigate({
        to: '/me',
        replace: true,
      });
    } else {
      // For internal routes, use client-side navigation
      window.location.href = '/api/login';
    }
  };

  return (
    <header className={getClassName('styledHeader')}>
      <div className={getClassName('container')}>
        <div className={getClassName('logoContainer')}>
          <div className={getClassName('logoWrapper')}>
            <FeatureText primary='@HAKIT' secondary='/EDITOR' />
            <div className={getClassName('logoGlow')} />
          </div>
        </div>

        <nav className={getClassName('nav')}>
          <ul className={getClassName('navList')}>
            <li className={getClassName('navItem')}>
              <a className={getClassName('navLink')} href='#features'>
                Features
              </a>
            </li>
            <li className={getClassName('navItem')}>
              <a className={getClassName('navLink')} href='#demo'>
                Demo
              </a>
            </li>
            <li className={getClassName('navItem')}>
              <a className={getClassName('navLink')} href='#benefits'>
                Benefits
              </a>
            </li>
            <li className={getClassName('navItem')}>
              <a className={getClassName('navLink')} href='#pricing'>
                Pricing
              </a>
            </li>
          </ul>
        </nav>

        <div className={getClassName('getStartedContainer')}>
          <PrimaryButton aria-label='' size='sm' onClick={handleAuthButtonClick} loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Loading...' : buttonState.label}
          </PrimaryButton>
        </div>

        <button className={getClassName('mobileMenuButton')} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className={getClassName('mobileMenu')}>
          <div className={getClassName('mobileMenuContainer')}>
            <ul className={getClassName('mobileNavList')}>
              <li className={getClassName('mobileNavItem')}>
                <a className={getClassName('mobileNavLink')} href='#features'>
                  Features
                </a>
              </li>
              <li className={getClassName('mobileNavItem')}>
                <a className={getClassName('mobileNavLink')} href='#demo'>
                  Demo
                </a>
              </li>
              <li className={getClassName('mobileNavItem')}>
                <a className={getClassName('mobileNavLink')} href='#benefits'>
                  Benefits
                </a>
              </li>
              <li className={getClassName('mobileNavItem')}>
                <a className={getClassName('mobileNavLink')} href='#pricing'>
                  Pricing
                </a>
              </li>
              <li className={getClassName('mobileNavItem')}>
                <PrimaryButton aria-label='' size='sm' fullWidth onClick={handleAuthButtonClick} disabled={isLoading}>
                  {isLoading ? 'Loading...' : buttonState.label}
                </PrimaryButton>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};
