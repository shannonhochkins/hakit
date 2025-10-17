import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { Undo } from './Undo';
import { Redo } from './Redo';
import { Save } from './Save';
import { Revert } from './Revert';
import { IconButton } from '@components/Button/IconButton';
import { PageSelector } from './PageSelector';
import { FeatureText } from '@components/FeatureText';
import { PageForm } from '../../../../../components/Modal/PageForm';
import { useCallback, useState } from 'react';
import styles from './Header.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { useGlobalStore } from '@hooks/useGlobalStore';

const getClassName = getClassNameFactory('Header', styles);

export function Header() {
  const navigate = useNavigate();
  const [newPageOpen, setOpenNewPage] = useState(false);
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const dashboard = useGlobalStore(state => state.dashboardWithoutData);
  const { isFullscreen } = useEditorUIStore();

  function handleBackToDashboards() {
    navigate({
      to: '/me/dashboards',
      replace: true,
    });
  }

  const onClose = useCallback(() => {
    setOpenNewPage(false);
  }, []);

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
        <div>
          <FeatureText primary='@HAKIT' secondary='/EDITOR' />
        </div>
        <div className={getClassName('Divider')} aria-hidden='true' />
        <div className={getClassName('PageControls')}>
          <PageSelector />
          <IconButton
            variant='transparent'
            tooltipProps={{
              placement: 'right',
            }}
            icon={<PlusIcon size={16} />}
            onClick={() => {
              setOpenNewPage(true);
            }}
            aria-label='Add new page'
          />
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
      <PageForm
        mode='new'
        dashboardId={dashboard?.id}
        isOpen={newPageOpen}
        onClose={onClose}
        onSuccess={newPage => {
          navigate({
            to: '/dashboard/$dashboardPath/$pagePath/edit',
            reloadDocument: false,
            params: {
              dashboardPath: params.dashboardPath,
              pagePath: newPage.path,
            },
          });
          setOpenNewPage(false);
        }}
      />
    </header>
  );
}
