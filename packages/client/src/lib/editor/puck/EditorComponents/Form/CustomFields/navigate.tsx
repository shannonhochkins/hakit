import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { AutoField } from '@measured/puck';
import { useLocalStorage } from '@editor/hooks/useLocalStorage';
import { useMemo } from 'react';

interface NavigateFieldProps {
  value: string;
  label?: string;
  onChange: (value: string) => void;
}

export function NavigateField({ value, label, onChange }: NavigateFieldProps) {
  const [id] = useLocalStorage<string | null>('id', null);
  const puckPageData = useGlobalStore(store => store.puckPageData);
  const dashboardItems = useMemo(() => puckPageData.root.dashboards ?? [], [puckPageData]);
  const options = useMemo(() => {
    return (
      dashboardItems
        // filter out the current dashboard from the list, no point linking to itself
        .filter(item => item.id !== id)
        .map(item => ({
          value: item.id,
          label: item.title,
        }))
    );
  }, [dashboardItems, id]);

  return (
    <AutoField
      field={{
        type: 'select',
        label: label ?? 'Unknown',
        options: options,
      }}
      onChange={onChange}
      value={value}
    />
  );
}
