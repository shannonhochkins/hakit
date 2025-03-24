import { useCallback } from 'react';
import { Save as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { updateDashboardPageForUser } from '@client/src/lib/api/dashboard';
import { useParams } from '@tanstack/react-router';

export function Save() {
  const params = useParams({
      from: "/_authenticated/dashboards/$dashboardPath/$pagePath/edit"
    });
  const data = useGlobalStore(store => store.unsavedPuckPageData);
  const dashboard = useGlobalStore(store => store.dashboard);
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
    })
  }, [params, dashboard, data]);
  return (
    <>
      <ProgressButton
        title='Save'
        onClick={() => {
          return save();
        }}
      >
        <SaveIcon size={21} />
      </ProgressButton>
    </>
  );
}
