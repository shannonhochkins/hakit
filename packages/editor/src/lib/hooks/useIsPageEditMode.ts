import { useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

export function useIsPageEditMode(): boolean {
  const editorParams = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
    shouldThrow: false,
  });
  // Check if both dashboardPath and pagePath are present in the params with /edit
  // if true, we're on the drag/drop edit page mode
  return useMemo(() => !!editorParams?.dashboardPath && !!editorParams?.pagePath, [editorParams]);
}
