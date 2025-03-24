import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, dashboardPageQueryOptions, deleteDashboard, deleteDashboardPage, updateDashboardPageForUser, updateDashboardForUser } from '@client/src/lib/api/dashboard';
import { useCallback, useState } from 'react';
import { DashboardPageWithoutData, DashboardWithoutPageData } from '@typings/dashboard';
import { Column, Row } from '@hakit/components';


export const Route = createFileRoute('/_authenticated/dashboards/')({
  component: RouteComponent,
});
// LANDING PAGE FOR ALL DASHBOARDS

function DashboardPageEditor({
  page,
  dashboard,
  key
}: {
  key: string;
  dashboard: DashboardWithoutPageData;
  page: DashboardPageWithoutData;
}) {
  const [pageName, setPageName] = useState<string>(page.name ?? '');
  const [pagePath, setPagePath] = useState<string>(page.path);
  const navigate = useNavigate();
  const pageQuery = useQuery(dashboardPageQueryOptions(dashboard.id, page.id));
  const fullPage = pageQuery.data;
  if (pageQuery.isLoading || !fullPage) {
    return <div>Loading...</div>
  }
  if (pageQuery.isError) {
    return <div>Error: {pageQuery.error.message}</div>
  }
  return <div key={key} style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    border: '1px solid black',
    margin: '20px',
    background: '#f1f1f1',
    padding: '20px',
  }}>
    <label>
      Name:&nbsp;
      <input value={pageName} onChange={(event) => {
        setPageName(event.target.value);
      }} />
    </label>
    <label>
      Path:&nbsp;
      <input value={pagePath} onChange={(event) => {
        setPagePath(event.target.value);
      }} />
    </label>
    <Row fullWidth gap="1rem" alignItems='flex-start' justifyContent='flex-start'>
      <button onClick={() => {
          updateDashboardPageForUser(dashboard.id, {
            name: pageName,
            path: pagePath,
            id: page.id,
            data: fullPage.data,
          }).then(() => {
            pageQuery.refetch();
          })
          
        }
      }>Save</button>
      <button onClick={() => {
          deleteDashboardPage({
            id: dashboard.id,
            pageId: page.id,
          }).then(() => {
            pageQuery.refetch();
          })
        }
      }>Delete</button>
      <button onClick={() => {
          navigate({
            to: '/dashboards/$dashboardPath/edit',
            params: {
              dashboardPath: dashboard.path,
            }
          });
        }
      }>Edit</button>
    </Row>
    <pre>{JSON.stringify(fullPage.data, null, 2)}</pre>
  </div>
}

function RouteComponent() {
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const navigate = useNavigate();
  const dashboards = dashboardsQuery.data;

  const _createConfiguration = useCallback(async () => {
    const name = await prompt('Dashboard Name');
    if (!name) return;
    const path = await prompt('Dashboard Path', name.toLowerCase().replace(/\s/g, '-'));
    if (!path) return;
    const data = {};
    const config = await createDashboard({
      name,
      path,
      data,
    });
    dashboardsQuery.refetch();
    console.log('new config', config);
  }, []);

  if (dashboardsQuery.isLoading || !dashboards) {
    return <div>Loading dashboards...</div>
  }
  if (dashboardsQuery.isError) {
    return <div>Error: {dashboardsQuery.error.message}</div>
  }
  return <>
    <button onClick={_createConfiguration}>Create new Dashboard</button>
    <h4>List of all Dashboards:</h4>
    {dashboards.map((dashboard) => {
      return <Column gap="1rem" key={dashboard.id} style={{
        border: '1px solid black',
        margin: '20px',
        background: '#f1f1f1',
        padding: 20,
      }}>
        <h4>Dashboard - {dashboard.name}</h4>
        <button onClick={() => {
          navigate({
            to: '/dashboards/$dashboardPath/edit',
            params: {
              dashboardPath: dashboard.path,
            }
          });
        }
      }>Edit</button>
      </Column>
    })}
  </>
}
