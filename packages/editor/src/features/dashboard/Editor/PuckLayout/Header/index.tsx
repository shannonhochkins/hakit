import { useNavigate } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { Undo } from './Undo';
import { Redo } from './Redo';
import { Save } from './Save';
import { Revert } from './Revert';
import { IconButton } from '@components/Button/IconButton';
import { PageSelector } from './PageSelector';
import styles from './Header.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { LogoMenu } from './LogoMenu';

const getClassName = getClassNameFactory('Header', styles);

export function Header() {
  const navigate = useNavigate();
  const { isFullscreen } = useEditorUIStore();

  function handleBackToDashboards() {
    navigate({
      to: '/me/dashboards',
      replace: true,
    });
  }

  return (
    <header className={getClassName({ hidden: isFullscreen }, getClassName('Header'))}>
      <div className={getClassName('Header-Left')}>
        <IconButton
          variant='transparent'
          icon={<ArrowLeftIcon size={18} />}
          onClick={handleBackToDashboards}
          tooltipProps={{ placement: 'right' }}
          aria-label='Back to dashboards'
        />
        <LogoMenu />
        <div className={getClassName('Divider')} aria-hidden='true' />
        <div className={getClassName('PageControls')}>
          <PageSelector />
        </div>
      </div>

      <div className={getClassName('Right')}>
        <div className={getClassName('UndoRedoGroup')}>
          <Undo />
          <Redo />
          <Revert />
        </div>

        <Save />
      </div>
    </header>
  );
}
