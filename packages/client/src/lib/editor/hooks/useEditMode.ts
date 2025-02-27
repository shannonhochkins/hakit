import { DEFAULT_EDIT_MODE } from '@editor/constants';
import { useLocalStorage } from '@editor/hooks/useLocalStorage';

export function useEditMode() {
  return useLocalStorage('editMode', DEFAULT_EDIT_MODE);
}
