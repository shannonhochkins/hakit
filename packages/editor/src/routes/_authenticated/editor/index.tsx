import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { dashboardsQueryOptions } from '@client/src/lib/api/dashboard';

export const Route = createFileRoute('/_authenticated/editor/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const dashboardsQuery = useQuery(dashboardsQueryOptions);

  const dashboards = dashboardsQuery.data;

  if (dashboardsQuery.isLoading || !dashboards) {
    return <div>Loading...</div>
  }
  if (dashboardsQuery.isError) {
    return <div>Error: {dashboardsQuery.error.message}</div>
  }
  return <>
    {dashboards.map((dashboard) => {
      return <div key={dashboard.id} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid black',
        margin: '20px',
      }}>
        <span>name: {dashboard.name}</span>
        <button onClick={() => {
            navigate({
              to: '/editor/$dashboardPath',
              params: {
                dashboardPath: dashboard.path,
              }
            });
          }
        }>Edit</button>
        Pages: {dashboard.pages?.map((page) => {
          return <span key={page.id}>{page.name}</span>
        })}
      </div>
    })}
  </>
}
