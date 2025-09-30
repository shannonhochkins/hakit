import { AutoField } from '@measured/puck';
import { useMemo, memo } from 'react';
import { useParams } from '@tanstack/react-router';
import { DashboardPageWithoutData } from '@typings/hono';
import { useDashboard } from '@hooks/queeries/useDashboard';
import { SelectField } from '../Select';

interface NavigateProps {
  value: DashboardPageWithoutData | DashboardPageWithoutData[];
  label?: React.ReactNode;
  muiltiSelect?: boolean;
  onChange: (value: DashboardPageWithoutData | DashboardPageWithoutData[]) => void;
  min?: number;
  max?: number;
  readOnly?: boolean;
  icon?: React.ReactNode;
  id?: string;
  name?: string;
  helperText?: string;
}

function DashboardPageMultiSelect({
  value,
  onChange,
  options,
  firstDashboard,
  min,
  max,
  label,
  readOnly,
  id,
  name,
  icon,
}: {
  label?: React.ReactNode;
  value?: DashboardPageWithoutData[];
  onChange: (value: DashboardPageWithoutData[]) => void;
  options: DashboardPageWithoutData[];
  firstDashboard?: DashboardPageWithoutData;
  min?: number;
  max?: number;
  readOnly?: boolean;
  id?: string;
  name?: string;
  icon?: React.ReactNode;
}) {
  const dashboardMap = useMemo(
    () =>
      new Map(
        value?.map(page => [page.id, page]) // or from external source if needed
      ),
    [value]
  );

  const handleChange = (rawValue: Array<{ page: string }>) => {
    const newValue = rawValue.map(({ page }) => dashboardMap.get(page)).filter((v): v is DashboardPageWithoutData => !!v);

    onChange(newValue);
  };

  const selectedMultiValue = useMemo(() => {
    return value ? value.map(item => ({ page: item.id })) : firstDashboard?.id ? [{ page: firstDashboard.id }] : [];
  }, [value, firstDashboard?.id]);

  return (
    <AutoField
      field={{
        type: 'array',
        label: label ?? 'Unknown',
        getItemSummary: (item: { page: string }) => {
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
        readOnly,
        icon,
        id,
        name,
      }}
      onChange={handleChange}
      value={selectedMultiValue}
    />
  );
}

export const PageField = memo(function PageField({
  value,
  label,
  muiltiSelect,
  min,
  max,
  onChange,
  readOnly,
  id,
  name,
  helperText,
  icon,
}: NavigateProps) {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { pagePath } = params;
  const dashboardQuery = useDashboard(params.dashboardPath);
  const dashboard = dashboardQuery?.data;
  const dashboardItems: DashboardPageWithoutData[] = useMemo(() => dashboard?.pages ?? [], [dashboard]);
  const options: DashboardPageWithoutData[] = useMemo(() => {
    return dashboardItems.map(item => ({
      ...item,
      name: item.name + (item.path === pagePath ? ` (current)` : ''),
    }));
  }, [dashboardItems, pagePath]);

  const [firstDashboard] = dashboardItems;

  const dashboardMap = useMemo(() => {
    return new Map(dashboardItems.map(item => [item.id, item]));
  }, [dashboardItems]);

  const handleChange = (
    value:
      | DashboardPageWithoutData
      | Array<{
          page: string;
        }>
  ) => {
    if (!Array.isArray(value)) {
      if (!value) {
        console.error('No dashboard found for id', value);
      } else {
        onChange({
          id: value.id,
          dashboardId: value.dashboardId,
          name: value.name,
          path: value.path,
          createdAt: value.createdAt,
          updatedAt: value.updatedAt,
          thumbnail: value.thumbnail,
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
          return [
            {
              id: matchedDashboard.id,
              dashboardId: matchedDashboard.dashboardId,
              name: matchedDashboard.name,
              path: matchedDashboard.path,
              createdAt: matchedDashboard.createdAt,
              updatedAt: matchedDashboard.updatedAt,
              thumbnail: matchedDashboard.thumbnail,
            },
          ];
        });
      onChange(pages);
    }
  };

  const _value = useMemo(() => {
    return value ? (value as DashboardPageWithoutData) : firstDashboard;
  }, [value, firstDashboard]);

  if (muiltiSelect) {
    return (
      <DashboardPageMultiSelect
        value={value as DashboardPageWithoutData[]}
        label={label}
        onChange={onChange}
        options={options}
        firstDashboard={firstDashboard}
        min={min}
        max={max}
        readOnly={readOnly}
        id={id}
        name={name}
      />
    );
  }

  return (
    <SelectField
      helperText={helperText}
      readOnly={readOnly}
      icon={icon}
      id={id ?? name ?? 'unknown'}
      name={name}
      options={options}
      value={_value}
      onChange={handleChange}
    />
  );
});
