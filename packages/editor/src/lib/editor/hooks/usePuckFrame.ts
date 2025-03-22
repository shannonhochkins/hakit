import { useEditMode } from './useEditMode';

export function usePuckFrame(): HTMLIFrameElement | null {
  const [editMode] = useEditMode();
  return editMode ? document.querySelector('iframe#preview-frame') : null;
}
