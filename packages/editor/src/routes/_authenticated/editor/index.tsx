import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, deleteDashboard, updateDashboardForUser } from '@client/src/lib/api/dashboard';
import { useCallback, useState } from 'react';
import { Dashboard } from '@typings/dashboard';

export const Route = createFileRoute('/_authenticated/editor/')({
  component: RouteComponent,
});

function DashboardEditor({
  dashboard,
  key
}: {
  key: string;
  dashboard: Dashboard;
}) {
  // using this query more than once will still only fetch once!
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const [dashboardName, setDashboardName] = useState<string>(dashboard.name ?? '');
  const [dashboardPath, setDashboardPath] = useState<string>(dashboard.path);
  const navigate = useNavigate();

  return <div key={key} style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    border: '1px solid black',
    margin: '20px',
  }}>
    <label>
      Name:
      <input value={dashboardName} onChange={(event) => {
        setDashboardName(event.target.value);
      }} />
    </label>
    <label>
      Path:
      <input value={dashboardPath} onChange={(event) => {
        setDashboardPath(event.target.value);
      }} />
    </label>
    <button onClick={() => {
        updateDashboardForUser({
          ...dashboard,
          name: dashboardName,
          path: dashboardPath,
        }).then(() => {
          dashboardsQuery.refetch();
        })
        
      }
    }>Save</button>
    <button onClick={() => {
        deleteDashboard({
          id: dashboard.id,
        }).then(() => {
          dashboardsQuery.refetch();
        })
      }
    }>Delete</button>
    <button onClick={() => {
        navigate({
          to: '/editor/$dashboardPath',
          params: {
            dashboardPath: dashboardPath,
          }
        });
      }
    }>Edit</button>
    Pages: {dashboard.pages?.map((page) => {
      return <span key={page.id}>{page.name}</span>
    })}
  </div>
}

function RouteComponent() {
  const dashboardsQuery = useQuery(dashboardsQueryOptions);

  const dashboards = dashboardsQuery.data;

  const _createConfiguration = useCallback(async () => {
    const name = await prompt('Dashboard Name');
    if (!name) return;
    const path = await prompt('Dashboard Path');
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
    return <div>Loading...</div>
  }
  if (dashboardsQuery.isError) {
    return <div>Error: {dashboardsQuery.error.message}</div>
  }
  return <>
    <button onClick={_createConfiguration}>Create new Dashboard</button>
    {dashboards.map((dashboard) => {
      return <DashboardEditor dashboard={dashboard} key={dashboard.id} />
    })}
  </>
}
