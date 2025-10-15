import { AutoField, UiState } from '@measured/puck';
import { useMemo, memo } from 'react';
import { useParams } from '@tanstack/react-router';
import { DashboardPageWithoutData } from '@typings/hono';
import { HelperText } from '../_shared/HelperText';
import { useQuery } from '@tanstack/react-query';
import { dashboardsQueryOptions } from '@services/dashboard';
import { FieldOption, PageValue } from '@typings/fields';
import { SelectField, SelectFieldProps } from '../Select';
type CommonProps = {
  min?: number;
  max?: number;
} & Omit<SelectFieldProps, 'onChange' | 'options' | 'renderValue' | 'value'>;

type PageFieldSingleProps = CommonProps & {
  multiple?: false;
  value?: PageValue;
  onChange: (value: PageValue) => void;
};

type PageFieldMultiProps = CommonProps & {
  multiple: true;
  value?: PageValue[];
  onChange: (value: PageValue[]) => void;
};

type PageFieldProps = PageFieldSingleProps | PageFieldMultiProps;

type DashboardValue = DashboardPageWithoutData & {
  dashboardName: string;
};

function getPage(dashboards: DashboardValue[], pageId: string): DashboardValue | undefined {
  return dashboards.find(d => d.id === pageId);
}

function DashboardPageMultiSelect({
  value,
  onChange,
  options,
  allPages,
  min,
  max,
  name,
  id,
}: {
  value?: PageValue[];
  onChange: (value: PageValue[], uiState?: Partial<UiState>) => void;
  options: FieldOption[];
  allPages: DashboardValue[];
  min?: number;
  max?: number;
  name?: string;
  id?: string;
}) {
  // we receive only the page id here, we have to convert this to the onChange
  const handleChange = (rawValue: Array<{ page: PageValue }>) => {
    const newValue = rawValue
      .map(item => {
        const page = getPage(allPages, item.page.pageId);
        return {
          pageId: page?.id,
          dashboardId: page?.dashboardId,
        };
      })
      .filter((v): v is PageValue => !!v.pageId && !!v.dashboardId);
    onChange(newValue);
  };

  const selectedMultiValue = useMemo(() => {
    return value ? value.map(item => ({ page: item })) : [];
  }, [value]);

  return (
    <>
      <AutoField
        field={{
          name: name,
          id: id,
          type: 'array',
          getItemSummary: (item: { page?: PageValue }) => {
            const matchedDashboard = getPage(allPages, item.page?.pageId ?? '');
            if (!matchedDashboard) {
              console.error('No dashboard found for id', item.page?.pageId);
              return 'Unknown page';
            }

            return matchedDashboard?.dashboardName + ' / ' + matchedDashboard?.name;
          },
          defaultItemProps: {
            page: {
              pageId: allPages[0]?.id,
              dashboardId: allPages[0]?.dashboardId,
            },
          },
          arrayFields: {
            page: {
              type: 'page',
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

function isPageValue(value: unknown): value is PageValue {
  return typeof value === 'object' && value !== null && typeof value === 'object' && 'pageId' in value && 'dashboardId' in value;
}
function isPageValueArray(value: unknown): value is PageValue[] {
  return Array.isArray(value) && value.every(item => isPageValue(item));
}

export const PageField = memo(function Page({ value, multiple, min, max, onChange, name, ...rest }: PageFieldProps) {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
    shouldThrow: false,
  });
  const pagePath = params?.pagePath;
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = dashboardsQuery.data;
  // create a map of all pages, and include the dashboard name each page object
  const allPages = useMemo(() => dashboards?.flatMap(d => d.pages.map(p => ({ ...p, dashboardName: d.name }))) ?? [], [dashboards]);
  const options = useMemo(() => {
    return allPages.map(item => ({
      value: item.id,
      label: item.dashboardName + ' / ' + item.name + (item.path === pagePath ? ` (current)` : ''),
    }));
  }, [allPages, pagePath]);

  const handleChange = (value: unknown) => {
    if (isPageValue(value)) {
      const matchedPage = allPages.find(item => item.id === value.pageId);
      if (!matchedPage) {
        console.error('No dashboard found for id', value.pageId);
      } else {
        (onChange as (v: PageValue) => void)(value);
      }
    } else if (isPageValueArray(value)) {
      const pages: PageValue[] = value
        .filter(page => !!page)
        .flatMap(page => {
          const matchedPage = getPage(allPages, page.pageId);
          if (!matchedPage) {
            console.error('Invalid page or dashboard not found', page?.pageId);
            return [];
          }
          return [
            {
              pageId: matchedPage.id,
              dashboardId: matchedPage.dashboardId,
            },
          ];
        });
      (onChange as (v: PageValue[]) => void)(pages);
    } else {
      console.error('Invalid value', value);
    }
  };

  if (multiple) {
    return (
      <DashboardPageMultiSelect
        name={name}
        value={value}
        onChange={onChange as (v: PageValue[]) => void}
        options={options}
        allPages={allPages}
        min={min}
        max={max}
      />
    );
  }
  // const singleValue = value
  //   ? { page: value.pageId }
  //   : ({
  //       page: allPages[0]?.id,
  //     } satisfies { page: string });

  const singleValue = options.find(item => item.value === value?.pageId) ?? options[0];

  return (
    <SelectField
      name={name}
      multiple={false}
      value={singleValue}
      options={options}
      renderValue={v => v.label}
      {...rest}
      onChange={e => {
        const page = getPage(allPages, e.value);
        handleChange({
          pageId: page?.id,
          dashboardId: page?.dashboardId,
        });
      }}
    />
  );
  // return (
  //   <AutoField
  //     name={name}
  //     field={{
  //       name: name,
  //       type: 'select',
  //       metadata: {
  //         type: 'page',
  //       },
  //       label: label,
  //       options: options,
  //       description: 'Select the page to navigate to',
  //     }}
  //     onChange={handleChange}
  //     // @ts-expect-error - TODO - fix this
  //     value={singleValue}
  //   />
  // );
});
