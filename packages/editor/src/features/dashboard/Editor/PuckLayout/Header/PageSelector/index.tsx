import { useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Row } from '@hakit/components';
import { SelectField } from '@components/Form/Fields/Select';
import { Layers } from 'lucide-react';
import { useDashboard } from '@hooks/queeries/useDashboard';

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
    <Row
      style={{
        maxWidth: '100%',
      }}
    >
      <SelectField
        value={value}
        options={pages}
        size='small'
        startAdornment={<Layers size={36} />}
        getOptionLabel={option => option.title}
        onChange={event => {
          const value = event?.target.value;
          if (typeof value === 'string') return;
          navigate({
            to: '/dashboard/$dashboardPath/$pagePath/edit',
            // quickest pathway forward to load new data
            reloadDocument: true,
            params: {
              dashboardPath: params.dashboardPath,
              pagePath: value.path,
            },
          });
        }}
      />
    </Row>
  );
}
