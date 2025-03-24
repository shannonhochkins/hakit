import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { dashboardByPathQueryOptions } from '@client/src/lib/api/dashboard';
import { useState } from 'react';
import { DashboardWithoutPageData } from '@typings/dashboard';
import { updateDashboardForUser, deleteDashboard } from '@client/src/lib/api/dashboard';
import { Row } from '@hakit/components';

export const Route = createFileRoute('/_authenticated/dashboards/$dashboardPath/edit')({
  component: RouteComponent,
});

function DashboardEditor({
  dashboard,
  ...rest
}: {
  dashboard: DashboardWithoutPageData;
}) {
  // using this query more than once will still only fetch once!
  const [dashboardName, setDashboardName] = useState<string>(dashboard.name ?? '');
  const page = dashboard.pages[0];
  const [dashboardPath, setDashboardPath] = useState<string>(dashboard.path);
  const navigate = useNavigate();

  return <div {...rest} style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    border: '1px solid black',
    margin: '20px',
    padding: '20px',
  }}>        
    <label>
      Name:&nbsp;
      <input value={dashboardName} onChange={(event) => {
        setDashboardName(event.target.value);
      }} />
    </label>
    <label>
      Path:&nbsp;
      <input value={dashboardPath} onChange={(event) => {
        setDashboardPath(event.target.value);
      }} />
    </label>
    <Row fullWidth gap="1rem" alignItems='flex-start' justifyContent='flex-start'>
      <button onClick={() => {
          updateDashboardForUser({
            id: dashboard.id,
            name: dashboardName,
            path: dashboardPath,
            data: dashboard.data,
            themeId: dashboard.themeId,
          })
          
        }
      }>Save</button>
      <button onClick={() => {
          deleteDashboard({
            id: dashboard.id,
          }).then(() => {
            navigate({
              to: '/dashboards'
            });
          })
        }
      }>Delete</button>
      <button onClick={() => {
        navigate({
          to: '/dashboards/$dashboardPath/$pagePath/edit',
          params: {
            dashboardPath: dashboard.path,
            pagePath: page.path,
          }
        });
      }}>
        Go to editor {page.name}
      </button>
    </Row>
  </div>
}

function RouteComponent() {
  const params = Route.useParams();
  const dashboardQuery = useQuery(dashboardByPathQueryOptions(params.dashboardPath));
  const dashboard = dashboardQuery.data;
  if (dashboardQuery.isLoading || !dashboard) {
    return <div>Loading dashboard data...</div>
  }
  if (dashboardQuery.isError) {
    return <div>Error: {dashboardQuery.error.message}</div>
  }
  if (!dashboard.pages.length) {
    return <div>No pages found, create one?</div>
  }
  return <div>
    <h4>Dashboard - {dashboard.name}</h4>
    <p>This page should house any logic for the current dashboard, for example uploading and assigning themes, components, enabling/disabling dynamic components</p>
    <DashboardEditor dashboard={dashboard} />
  </div>
}
