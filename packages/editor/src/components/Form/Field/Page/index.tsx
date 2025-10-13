import { AutoField } from '@measured/puck';
import { useMemo, memo, ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { DashboardPageWithoutData } from '@typings/hono';
import { useDashboard } from '@hooks/queeries/useDashboard';
import { HelperText } from '../_shared/HelperText';
type CommonProps = {
  readOnly?: boolean;
  icon?: React.ReactNode;
  id?: string;
  name?: string;
  helperText?: string;
  label?: ReactNode;
  min?: number;
  max?: number;
};

type PageFieldSingleProps = CommonProps & {
  multiple?: false;
  value?: DashboardPageWithoutData | string;
  onChange: (value: DashboardPageWithoutData) => void;
};

type PageFieldMultiProps = CommonProps & {
  multiple: true;
  value?: DashboardPageWithoutData[] | string[];
  onChange: (value: DashboardPageWithoutData[]) => void;
};

type PageFieldProps = PageFieldSingleProps | PageFieldMultiProps;

function DashboardPageMultiSelect({
  value,
  onChange,
  options,
  firstDashboard,
  dashboardMap,
  min,
  max,
}: {
  value?: DashboardPageWithoutData[];
  onChange: (value: DashboardPageWithoutData[]) => void;
  options: { value: string; label: string }[];
  firstDashboard?: DashboardPageWithoutData;
  dashboardMap: Map<string, DashboardPageWithoutData>;
  min?: number;
  max?: number;
}) {
  const handleChange = (rawValue: Array<{ page: string }>) => {
    const newValue = rawValue.map(({ page }) => dashboardMap.get(page)).filter((v): v is DashboardPageWithoutData => !!v);
    onChange(newValue);
  };

  const selectedMultiValue = useMemo(() => {
    return value ? value.map(item => ({ page: item.id })) : firstDashboard?.id ? [{ page: firstDashboard.id }] : [];
  }, [value, firstDashboard?.id]);

  return (
    <>
      <AutoField
        field={{
          type: 'array',
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
              description: 'Select the page to navigate to',
              options,
              metadata: {
                type: 'page',
              },
            },
          },
          min,
          max,
        }}
        onChange={handleChange}
        value={selectedMultiValue}
      />
      {selectedMultiValue.length === 0 && <HelperText helperText={'Add a page to the list'} />}
    </>
  );
}
export const PageField = memo(function Page({ value, label, multiple, min, max, onChange }: PageFieldProps) {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { pagePath } = params;
  const dashboardQuery = useDashboard(params.dashboardPath);
  const dashboard = dashboardQuery?.data;
  const dashboardItems = useMemo(() => dashboard?.pages ?? [], [dashboard]);
  const options = useMemo(() => {
    return dashboardItems.map(item => ({
      value: item.id,
      label: item.name + (item.path === pagePath ? ` (current)` : ''),
    }));
  }, [dashboardItems, pagePath]);

  const [firstDashboard] = dashboardItems;

  const dashboardMap = useMemo(() => {
    return new Map(dashboardItems.map(item => [item.id, item]));
  }, [dashboardItems]);

  const handleChange = (
    value:
      | string
      | Array<{
          page: string;
        }>
  ) => {
    if (typeof value === 'string') {
      const matchedDashboard = dashboardItems.find(item => item.id === value);
      if (!matchedDashboard) {
        console.error('No dashboard found for id', value);
      } else {
        (onChange as (v: DashboardPageWithoutData) => void)({
          id: matchedDashboard.id,
          dashboardId: matchedDashboard.dashboardId,
          name: matchedDashboard.name,
          path: matchedDashboard.path,
          createdAt: matchedDashboard.createdAt,
          updatedAt: matchedDashboard.updatedAt,
          thumbnail: matchedDashboard.thumbnail,
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
      (onChange as (v: DashboardPageWithoutData[]) => void)(pages);
    }
  };

  if (multiple) {
    const normalizedMultiValue: DashboardPageWithoutData[] | undefined = Array.isArray(value)
      ? typeof value[0] === 'string'
        ? (value as string[]).map(v => dashboardMap.get(v)).filter((v): v is DashboardPageWithoutData => !!v)
        : (value as DashboardPageWithoutData[])
      : undefined;
    return (
      <DashboardPageMultiSelect
        value={normalizedMultiValue}
        onChange={onChange as (v: DashboardPageWithoutData[]) => void}
        options={options}
        dashboardMap={dashboardMap}
        firstDashboard={firstDashboard}
        min={min}
        max={max}
      />
    );
  }

  return (
    <AutoField
      field={{
        type: 'select',
        metadata: {
          type: 'page',
        },
        label: label,
        options: options,
        description: 'Select the page to navigate to',
      }}
      onChange={handleChange}
      value={typeof value === 'string' ? value : value ? (value as DashboardPageWithoutData).id : firstDashboard.id}
    />
  );
});
