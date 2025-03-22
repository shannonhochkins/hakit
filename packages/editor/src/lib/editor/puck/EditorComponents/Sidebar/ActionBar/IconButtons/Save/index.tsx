import { useLocalStorage } from '@editor/hooks/useLocalStorage';
import { callApi } from '@editor/hooks/useApi';
import { useCallback } from 'react';
import { Save as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';

export function Save() {
  const [id] = useLocalStorage<string | null>('id', null);
  const data = useGlobalStore(store => store.puckPageData);
  const save = useCallback(async () => {
    if (!id) {
      return Promise.reject('No ID found');
    }
    return callApi('/api/page/configuration/save', {
      data,
      id,
    });
  }, [id, data]);
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
