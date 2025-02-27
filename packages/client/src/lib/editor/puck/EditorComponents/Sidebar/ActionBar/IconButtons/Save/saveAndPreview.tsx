import { useLocalStorage } from '@editor/hooks/useLocalStorage';
import { callApi } from '@editor/hooks/useApi';
import { useCallback } from 'react';
import { SquareArrowOutUpRight as SaveIcon } from 'lucide-react';
import { ProgressButton } from './ProgressButton';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { useEditMode } from '@editor/hooks/useEditMode';

export function SaveAndPreview() {
  const [id] = useLocalStorage<string | null>('id', null);
  const [, setEditMode] = useEditMode();
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
        title='Save and Preview'
        onClick={() => {
          return save().then(() => {
            setEditMode(false);
          });
        }}
      >
        <SaveIcon size={21} />
      </ProgressButton>
    </>
  );
}
