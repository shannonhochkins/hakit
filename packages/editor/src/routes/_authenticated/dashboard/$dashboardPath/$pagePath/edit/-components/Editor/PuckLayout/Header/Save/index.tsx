import { useCallback } from 'react';
import { ExternalLink, Save as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { updateDashboardPageForUser, updateDashboardForUser } from '@client/src/lib/api/dashboard';
import { useParams } from '@tanstack/react-router';
import { useUnsavedChanges } from '@lib/hooks/useUnsavedChanges';

export function Save() {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { hasUnsavedChanges, removeStoredData } = useUnsavedChanges();

  const save = useCallback(async () => {
    const { unsavedPuckPageData, setUnsavedPuckPageData, dashboard, breakpointItems } = useGlobalStore.getState();
    if (!unsavedPuckPageData) return;
    if (!dashboard) {
      return Promise.reject('No dashboard found');
    }
    const page = dashboard.pages.find(page => page.path === params.pagePath);
    if (!page) {
      return Promise.reject(`No page found with path ${params.pagePath}`);
    }

    // Perform the save
    await updateDashboardPageForUser(dashboard.id, {
      id: page.id,
      data: unsavedPuckPageData,
    });
    await updateDashboardForUser({
      ...dashboard,
      breakpoints: breakpointItems,
    });
    // reset so we can determine and track unsaved changes
    setUnsavedPuckPageData(null);
    // Clear local storage after successful save
    removeStoredData();
  }, [params.pagePath, removeStoredData]);

  return (
    <>
      <ProgressButton
        title={hasUnsavedChanges ? 'Save' : 'View Page'}
        onClick={async () => {
          if (hasUnsavedChanges) {
            return save();
          } else {
            // Open view page in new tab
            const viewUrl = `/dashboard/${params.dashboardPath}/${params.pagePath}`;
            window.open(viewUrl, '_blank');
            return Promise.resolve();
          }
        }}
        variant={hasUnsavedChanges ? 'primary' : 'success'}
      >
        {hasUnsavedChanges ? <SaveIcon size={18} /> : <ExternalLink size={18} />}
        <span
          style={{
            lineHeight: '19px',
          }}
        >
          {hasUnsavedChanges ? 'SAVE' : 'VIEW'}
        </span>
      </ProgressButton>
    </>
  );
}
