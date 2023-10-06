import { useCallback } from 'react';
import { useWriteFile } from './';
import { PageConfig } from '@client/store';
import { CONFIGURATION_FILENAME } from '@client/store/constants';
import { toast } from 'react-toastify';

export function useSaveConfiguration() {
  const writeFile = useWriteFile();
  return useCallback(async (content: PageConfig[]) => {
      try {
        await writeFile({
          content: JSON.stringify(content, null, 2),
          filename: CONFIGURATION_FILENAME
        });
        toast.success('Successfully saved');
      } catch (e) {
        toast.error('Oops! Something went wrong');
        console.error('Save configuration error:', e);
      }
  }, [writeFile]);
}