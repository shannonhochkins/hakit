import { FeatureText } from '@components/FeatureText';
import { Row } from '@components/Layout';
import { ChevronDown, Copy, FolderPen, PlusIcon, Save, SaveAllIcon } from 'lucide-react';
import styles from './LogoMenu.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { MenuItem, Menu, MenuContent, MenuAnchor } from '@components/Menu';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useUnsavedChanges } from '@hooks/useUnsavedChanges';
import { useCallback, useState } from 'react';
import { PageForm } from '@components/Modal/PageForm';
import { DashboardForm } from '@components/Modal/DashboardForm';
import { DashboardPageWithoutData } from '@typings/hono';
import { toast } from 'react-toastify';

const getClassName = getClassNameFactory('LogoMenu', styles);

export function LogoMenu() {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const navigate = useNavigate();
  const { hasUnsavedChanges, removeStoredData } = useUnsavedChanges();
  const dashboard = useGlobalStore(state => state.dashboardWithoutData);
  const [newPageOpen, setOpenNewPage] = useState(false);
  const [renamePageOpen, setRenamePageOpen] = useState(false);
  const [renameDashboardOpen, setRenameDashboardOpen] = useState(false);
  const [duplicatePageOpen, setDuplicatePageOpen] = useState(false);
  const matchedPage = dashboard?.pages?.find(page => page.path === params.pagePath);

  const save = useCallback(async () => {
    const actions = useGlobalStore.getState().actions;
    return await actions.save(params.pagePath, removeStoredData);
  }, [params.pagePath, removeStoredData]);

  const onClose = useCallback(() => {
    setOpenNewPage(false);
    setRenamePageOpen(false);
    setDuplicatePageOpen(false);
    setRenameDashboardOpen(false);
  }, []);

  function handlePageFormSuccess(newPage: DashboardPageWithoutData) {
    navigate({
      to: '/dashboard/$dashboardPath/$pagePath/edit',
      reloadDocument: false,
      params: {
        dashboardPath: params.dashboardPath,
        pagePath: newPage.path,
      },
    });
    onClose();
  }

  function handleDashboardFormSuccess({ path }: { path?: string; id?: string; name: string }) {
    if (!path) {
      toast.error('Dashboard path is missing. Please refresh and try again.');
      return;
    }
    if (!matchedPage) {
      toast.error('Current page not found. Please refresh and try again.');
      return;
    }
    navigate({
      to: '/dashboard/$dashboardPath/$pagePath/edit',
      reloadDocument: false,
      params: {
        dashboardPath: path,
        pagePath: matchedPage.path,
      },
    });
    onClose();
  }

  return (
    <>
      <Menu>
        <MenuAnchor>
          <Row gap={'var(--space-2)'} alignItems='center' justifyContent='center' className={getClassName('LogoMenu')}>
            <div>
              <FeatureText primary='@HAKIT' secondary='/EDITOR' />
            </div>
            <ChevronDown size={16} />
          </Row>
        </MenuAnchor>
        <MenuContent>
          <MenuItem disabled={!hasUnsavedChanges} label='Save' onClick={() => save()} startIcon={<Save size={16} />} />
          <MenuItem
            disabled={!hasUnsavedChanges}
            label='Save & Preview'
            startIcon={<SaveAllIcon size={16} />}
            onClick={() => {
              save().then(() => {
                // Open view page in new tab
                const viewUrl = `/dashboard/${params.dashboardPath}/${params.pagePath}`;
                window.open(viewUrl, '_blank');
                return Promise.resolve();
              });
            }}
          />
          <MenuItem label='Create new page' onClick={() => setOpenNewPage(true)} startIcon={<PlusIcon size={16} />} />
          <MenuItem label='Rename dashboard' onClick={() => setRenameDashboardOpen(true)} startIcon={<FolderPen size={16} />} />
          <MenuItem label='Rename current page' onClick={() => setRenamePageOpen(true)} startIcon={<FolderPen size={16} />} />
          <MenuItem label='Duplicate current page' onClick={() => setDuplicatePageOpen(true)} startIcon={<Copy size={16} />} />
        </MenuContent>
      </Menu>
      <PageForm
        mode={renamePageOpen ? 'edit' : duplicatePageOpen ? 'duplicate' : 'new'}
        dashboardId={dashboard?.id}
        pageId={renamePageOpen || duplicatePageOpen ? matchedPage?.id : undefined}
        isOpen={newPageOpen || renamePageOpen || duplicatePageOpen}
        onClose={onClose}
        onSuccess={handlePageFormSuccess}
      />
      <DashboardForm
        mode={'edit'}
        dashboardId={dashboard?.id}
        isOpen={renameDashboardOpen}
        onClose={onClose}
        onSuccess={handleDashboardFormSuccess}
      />
    </>
  );
}
