import { useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { SelectField } from '@components/Form/Field/Select';
import { Layers } from 'lucide-react';
import { useDashboard } from '@hooks/queeries/useDashboard';
import styles from './PageSelector.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('PageSelector', styles);

export function PageSelector() {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { data } = useDashboard(params.dashboardPath);
  const navigate = useNavigate();
  const pages = useMemo(() => {
    return (
      data?.pages.map(page => ({
        id: page.id,
        title: page.name,
        path: page.path,
      })) || []
    );
  }, [data?.pages]);
  // get the current page from the params
  const value = pages.find(page => page.path === params.pagePath) || pages[0];

  if (!value) {
    return null;
  }

  return (
    <div className={getClassName()}>
      <SelectField
        id='page-selector'
        value={{
          label: value.title,
          value: value.id,
        }}
        options={pages.map(page => ({
          label: page.title,
          value: page.id,
        }))}
        size='small'
        startAdornment={<Layers size={36} />}
        renderOption={option => option.label}
        onChange={option => {
          const page = data?.pages.find(page => page.id === option.value);
          if (typeof page === 'undefined') return;
          navigate({
            to: '/dashboard/$dashboardPath/$pagePath/edit',
            // quickest pathway forward to load new data
            reloadDocument: true,
            params: {
              dashboardPath: params.dashboardPath,
              pagePath: page.path,
            },
          });
        }}
      />
    </div>
  );
}
