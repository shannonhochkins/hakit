import { useCallback } from 'react';
import { SquareArrowOutUpRight as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { updateDashboardPageForUser } from '@client/src/lib/api/dashboard';
import { useNavigate, useParams } from '@tanstack/react-router';

export function SaveAndPreview() {
  const navigate = useNavigate();
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
    });
  }, [params, dashboard, data]);

  if (!dashboard) {
    return null;
  }
  return (
    <>
      <ProgressButton
        title='Save and Preview'
        onClick={() => {
          return save().then(() => {
            navigate({
              to: '/dashboards/$dashboardPath/$pagePath',
              params: {
                dashboardPath: params.dashboardPath,
                pagePath: params.pagePath
              }
            })
          });
        }}
      >
        <SaveIcon size={21} />
      </ProgressButton>
    </>
  );
}
