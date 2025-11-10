import { FeatureText } from '@components/FeatureText';
import { Row } from '@components/Layout';
import { ChevronDown, Copy, FolderPen, Layers2, PlusIcon, Save, SaveAllIcon } from 'lucide-react';
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

type FormMode = 'new' | 'edit' | 'duplicate';
interface PageFormState {
  mode: FormMode;
  pageId?: string;
}
interface DashboardFormState {
  mode: FormMode;
}

export function LogoMenu() {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const navigate = useNavigate();
  const { hasUnsavedChanges, removeStoredData } = useUnsavedChanges();
  const dashboard = useGlobalStore(state => state.dashboardWithoutData);

  const [pageForm, setPageForm] = useState<PageFormState | null>(null);
  const [dashboardForm, setDashboardForm] = useState<DashboardFormState | null>(null);
  const matchedPage = dashboard?.pages?.find(page => page.path === params.pagePath);

  const save = useCallback(async () => {
    const actions = useGlobalStore.getState().actions;
    return await actions.save(params.pagePath, removeStoredData);
  }, [params.pagePath, removeStoredData]);

  const closePageForm = useCallback(() => setPageForm(null), []);
  const closeDashboardForm = useCallback(() => setDashboardForm(null), []);
  const onClose = useCallback(() => {
    closePageForm();
    closeDashboardForm();
  }, [closePageForm, closeDashboardForm]);

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
      <Menu disableAutoPositioning>
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
          <MenuItem variant='group' label='Page Actions' startIcon={<Layers2 size={16} />}>
            <MenuItem label='Create new' onClick={() => setPageForm({ mode: 'new' })} startIcon={<PlusIcon size={16} />} />
            <MenuItem
              label='Rename'
              onClick={() => matchedPage && setPageForm({ mode: 'edit', pageId: matchedPage.id })}
              startIcon={<FolderPen size={16} />}
            />
            <MenuItem
              label='Duplicate'
              onClick={() => matchedPage && setPageForm({ mode: 'duplicate', pageId: matchedPage.id })}
              startIcon={<Copy size={16} />}
            />
          </MenuItem>
          <MenuItem variant='group' label='Dashboard Actions' startIcon={<Layers2 size={16} />}>
            <MenuItem label='Create new' onClick={() => setDashboardForm({ mode: 'new' })} startIcon={<PlusIcon size={16} />} />
            <MenuItem label='Rename' onClick={() => setDashboardForm({ mode: 'edit' })} startIcon={<FolderPen size={16} />} />
            <MenuItem label='Duplicate' onClick={() => setDashboardForm({ mode: 'duplicate' })} startIcon={<Copy size={16} />} />
          </MenuItem>
        </MenuContent>
      </Menu>
      <PageForm
        mode={pageForm?.mode ?? 'new'}
        dashboardId={dashboard?.id}
        pageId={pageForm?.pageId}
        isOpen={!!pageForm}
        onClose={closePageForm}
        onSuccess={handlePageFormSuccess}
      />
      <DashboardForm
        mode={dashboardForm?.mode ?? 'new'}
        dashboardId={dashboard?.id}
        isOpen={!!dashboardForm}
        onClose={closeDashboardForm}
        onSuccess={handleDashboardFormSuccess}
      />
    </>
  );
}
