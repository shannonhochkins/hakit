import { useCallback } from 'react';
import { useWriteFile } from './';
import { useHakitStore } from '@client/store';
import { CONFIGURATION_FILENAME } from '@client/store/constants';
import { toast } from 'react-toastify';

export function useSaveConfiguration() {
  const writeFile = useWriteFile();
  const config = useHakitStore(state => state.config);
  return useCallback(async () => {
      try {
        console.log('config', config);
        await writeFile({
          content: JSON.stringify(config, null, 2),
          filename: CONFIGURATION_FILENAME
        });
        toast.success('Successfully saved');
      } catch (e) {
        toast.error('Oops! Something went wrong');
        console.error('Save configuration error:', e);
      }
  }, [writeFile, config]);
}