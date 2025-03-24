import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { AutoField } from '@measured/puck';
import { useMemo } from 'react';
import { useParams } from '@tanstack/react-router';

interface NavigateFieldProps {
  value: string;
  label?: string;
  onChange: (value: string) => void;
}

export function NavigateField({ value, label, onChange }: NavigateFieldProps) {
  const params = useParams({
    from: '/_authenticated/dashboards/$dashboardPath/$pagePath/edit'
  });
  const { pagePath } = params;
  const dashboard = useGlobalStore(store => store.dashboard);
  const dashboardItems = useMemo(() => dashboard?.pages ?? [], [dashboard]);
  const options = useMemo(() => {
    return (
      dashboardItems
        // filter out the current dashboard from the list, no point linking to itself
        .filter(item => item.path !== pagePath)
        .map(item => ({
          value: item.id,
          label: item.name,
        }))
    );
  }, [dashboardItems, pagePath]);

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
