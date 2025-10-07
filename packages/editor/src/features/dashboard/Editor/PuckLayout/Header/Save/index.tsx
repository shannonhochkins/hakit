import { useCallback } from 'react';
import { ExternalLink, Save as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useParams } from '@tanstack/react-router';
import { useUnsavedChanges } from '@hooks/useUnsavedChanges';

export function Save() {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { hasUnsavedChanges, removeStoredData } = useUnsavedChanges();
  const { actions } = useGlobalStore();

  const save = useCallback(async () => {
    await actions.save(params.pagePath, removeStoredData);
  }, [actions, params.pagePath, removeStoredData]);

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
