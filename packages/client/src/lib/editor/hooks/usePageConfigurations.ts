import { useMemo } from 'react';
import { useApi } from './useApi';
import { useEditMode } from './useEditMode';

export function usePageConfigurations(retriggerValue?: unknown) {
  const [editMode] = useEditMode();
  const triggerValue = useMemo(() => ({ editMode, retriggerValue }), [editMode, retriggerValue]);
  return useApi(
    {
      endpoint: `/api/page/configurations`,
    },
    triggerValue
  );
}
