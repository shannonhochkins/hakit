import { useCallback } from 'react';
import { Save as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { updateDashboardPageForUser, updateDashboardForUser } from '@client/src/lib/api/dashboard';
import { useParams } from '@tanstack/react-router';

export function Save() {
  const params = useParams({
      from: "/_authenticated/dashboard/$dashboardPath/$pagePath/edit"
    });
  const data = useGlobalStore(store => store.unsavedPuckPageData);
  const dashboard = useGlobalStore(store => store.dashboard);
  const breakpointItems = useGlobalStore(store => store.breakpointItems);
  const save = useCallback(async () => {
    if (!dashboard) {
      return Promise.reject('No dashboard found');
    }
    const page = dashboard.pages.find(page => page.path === params.pagePath);
    if (!page) {
      return Promise.reject(`No page found with path ${params.pagePath}`);
    }
    updateDashboardPageForUser(dashboard.id, {
      id: page.id,
      data
    });
    updateDashboardForUser({
      ...dashboard,
      breakpoints: breakpointItems,
    });
  }, [dashboard, data, breakpointItems, params.pagePath]);
  return (
    <>
      <ProgressButton
        title='Save'
        onClick={() => {
          return save();
        }}
      >
        <SaveIcon size={21} />
        <span style={{
          lineHeight: '21px',
        }}>SAVE</span>
      </ProgressButton>
    </>
  );
}
