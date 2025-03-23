import { useLocalStorage } from '@editor/hooks/useLocalStorage';

const DEFAULT_EDIT_MODE: boolean = false as const;

export function useEditMode() {
  return useLocalStorage('editMode', DEFAULT_EDIT_MODE);
}
