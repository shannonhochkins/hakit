import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { AutoField } from '@measured/puck';
import { useMemo, memo } from 'react';
import { useParams } from '@tanstack/react-router';
import { DashboardPageWithoutData } from '@typings/dashboard';


interface NavigateProps {
  value: DashboardPageWithoutData | DashboardPageWithoutData[];
  label?: string;
  muiltiSelect?: boolean;
  onChange: (value: DashboardPageWithoutData | DashboardPageWithoutData[]) => void;
  min?: number;
  max?: number;
}

function DashboardPageMultiSelect({
  value,
  onChange,
  options,
  firstDashboard,
  min,
  max,
  label,
}: {
  label?: string;
  value?: DashboardPageWithoutData[];
  onChange: (value: DashboardPageWithoutData[]) => void;
  options: { value: string; label: string }[];
  firstDashboard?: DashboardPageWithoutData;
  min?: number;
  max?: number;
}) {
  const dashboardMap = useMemo(() => new Map(
    value?.map(page => [page.id, page]) // or from external source if needed
  ), [value]);

  const handleChange = (rawValue: Array<{ page: string }>) => {
    const newValue = rawValue
      .map(({ page }) => dashboardMap.get(page))
      .filter((v): v is DashboardPageWithoutData => !!v);

    onChange(newValue);
  };

  const selectedMultiValue = useMemo(() => {
    return value
      ? (value as DashboardPageWithoutData[]).map((item) => ({ page: item.id }))
      : firstDashboard?.id
        ? [{ page: firstDashboard.id }]
        : [];
  }, [value, firstDashboard?.id]);

  return (
    <AutoField
      field={{
        type: 'array',
        label: label ?? 'Unknown',
        getItemSummary: (item: {
          page: string;
        }) => {
          const matchedDashboard = dashboardMap.get(item.page);
          return matchedDashboard?.name ?? firstDashboard?.name ?? '';
        },
        defaultItemProps: {
          page: firstDashboard?.id,
        },
        arrayFields: {
          page: {
            type: 'select',
            label: 'Select Page',
            options,
          },
        },
        min,
        max,
      }}
      onChange={handleChange}
      value={selectedMultiValue}
    />
  );
}

export const Page = memo(function Page({ value, label, muiltiSelect, min, max, onChange }: NavigateProps) {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit'
  });
  const { pagePath } = params;
  const dashboard = useGlobalStore(store => store.dashboard);
  const dashboardItems = useMemo(() => dashboard?.pages ?? [], [dashboard]);
  const options = useMemo(() => {
    return (
      dashboardItems
        .map(item => ({
          value: item.id,
          label: item.name + (item.path === pagePath ? ` (current)` : ''),
        }))
    );
  }, [dashboardItems, pagePath]);

  const [firstDashboard] = dashboardItems;

  const dashboardMap = useMemo(() => {
    return new Map(dashboardItems.map(item => [item.id, item]));
  }, [dashboardItems]);

  const handleChange = (value: string | Array<{
    page: string
  }>) => {
    if (typeof value === 'string') {
      const matchedDashboard = dashboardItems.find(item => item.id === value);
      if (!matchedDashboard) {
        console.error('No dashboard found for id', value);
      } else {
        onChange({
          id: matchedDashboard.id,
          name: matchedDashboard.name,
          path: matchedDashboard.path,
        });
      }
    } else {
      const pages: DashboardPageWithoutData[] = value
        .filter(page => !!page)
        .flatMap(page => {
          const matchedDashboard = dashboardMap.get(page.page);
          if (!matchedDashboard) {
            console.error('Invalid page or dashboard not found', page?.page);
            return [];
          }
          return [{
            id: matchedDashboard.id,
            name: matchedDashboard.name,
            path: matchedDashboard.path
          }];
        });
      onChange(pages);
    }
  }


  if (muiltiSelect) {
   return <DashboardPageMultiSelect
      value={value as DashboardPageWithoutData[]}
      label={label}
      onChange={onChange}
      options={options}
      firstDashboard={firstDashboard}
      min={min}
      max={max}
    />
  }

  return (
    <AutoField
      field={{
        type: 'select',
        label: label ?? 'Unknown',
        options: options,
      }}
      onChange={handleChange}
      value={value ? (value as DashboardPageWithoutData).id : firstDashboard.id}
    />
   
  );
})
