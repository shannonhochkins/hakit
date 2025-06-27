import { useNavigate, useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react';
import { Row } from '@hakit/components';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { SelectField } from '@lib/components/Form/Fields/Select';
import { CirclePlus, Layers } from 'lucide-react';
import { PageForm } from '@lib/page/me/Dashboards/PageForm';
import { useDashboard } from '@lib/hooks/queeries/useDashboard';


export function PageSelector() {
  const [newPageOpen, setOpenNewPage] =  useState(false);
  const dashboard = useGlobalStore(state => state.dashboard);
  const params = useParams({
    from: "/_authenticated/dashboard/$dashboardPath/$pagePath/edit"
  });
  const { data } = useDashboard(params.dashboardPath);
  const navigate = useNavigate();
  const pages = useMemo(() => {
    return data?.pages.map(page => ({
      id: page.id,
      title: page.name,
      path: page.path,
    })) || [];
  }, [data?.pages])
  // get the current page from the params
  const value = pages.find(page => page.path === params.pagePath) || pages[0];
  
  if (!value) {
    return null;
  }

  return <Row style={{
    maxWidth: '100%',
  }}>
    <SelectField
      value={value}
      options={[...pages, {
        id: 'new',
        title: 'Customize',
        path: '__new__'
      }]}
      size="small"
      startAdornment={<Layers size={36} style={{
        marginRight: '0.5rem',
      }} />}
      getOptionLabel={(option) => option.id === 'new' ? <Row gap="0.5rem" fullHeight>
        <CirclePlus size={16} />
        New Page
      </Row> : option.title}
      onChange={(event) => {
        const value = event?.target.value;
        if (typeof value === 'string' || value.id === 'new') {
          // empty value, consider we've hit the "edit" option
          setOpenNewPage(true);
        } else {
          navigate({
            to: '/dashboard/$dashboardPath/$pagePath/edit',
            // quickest pathway forward to load new data
            reloadDocument: true,
            params: {
              dashboardPath: params.dashboardPath,
              pagePath: value.path
            }
          })
        }
      }}
    />
    <PageForm mode="new" dashboardId={dashboard?.id} isOpen={newPageOpen} onClose={() => {
      setOpenNewPage(false);
    }} onSuccess={(newPage) => {
      console.log('newPage', newPage);
      navigate({
        to: '/dashboard/$dashboardPath/$pagePath/edit',
        // quickest pathway forward to load new data
        reloadDocument: true,
        params: {
          dashboardPath: params.dashboardPath,
          pagePath: newPage.path
        }
      });
      setOpenNewPage(false);
    }} />
  </Row>
}