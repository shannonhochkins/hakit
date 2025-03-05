import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { userQueryOptions } from '../lib/api/user';
import { createDashboard, dashboardsQueryOptions, getDashboardForUser, getDashboardsForUser, getPageConfigurationForUser } from '../lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useQuery(userQueryOptions);
  const configurations = useQuery(dashboardsQueryOptions);


  const _getConfigurationsForUser = useCallback(async () => {
    const config = await getDashboardsForUser();
    console.log('config', config);
  }, [])

  const _getPageConfigurationForUser = useCallback(async (dashboardPath: string, pathPath: string) => {
    const dashboard = await getPageConfigurationForUser(dashboardPath, pathPath);
    console.log('dashboard', dashboard);
  }, [])

  const _getDashboardForUser = useCallback(async (dashboardPath: string) => {
    const dashboard = await getDashboardForUser(dashboardPath);
    console.log('dashboard', dashboard);
  }, [])

  const _createConfiguration = useCallback(async () => {
    if (!user.data) return;
    const name = await prompt('Dashboard Name');
    if (!name) return;
    const path = await prompt('Dashboard Path');
    if (!path) return;
    const data = {};
    const config = await createDashboard({
      name,
      path,
      data,
    })
    console.log('new config', config);
  }, [user]);

  // const _getCurrentUser = useCallback(async () => {
  //   const user = await getCurrentUser('1', 'mail@shannonhochkins.com');
  //   console.log('user', user);
  // }, [])

  // const _createUser = useCallback(async () => {
  //   const user = await createUser({value: { email: 'mail@shannonhochkins.com', name: 'Shannon hochkins' }})
  //   console.log('new user', user);
  // }, [])
  return <div>Hello &quot;/&quot;!
    <button onClick={() => _getConfigurationsForUser()}>GET CONFIG</button>
    {configurations.data && configurations.isSuccess && Array.isArray(configurations.data) && configurations.data.map((dashboard) => {
      return <button key={dashboard.id} onClick={() => {
        _getDashboardForUser(dashboard.path);
      }}>{dashboard.name}</button>
    })}
    <button disabled={!user.data} onClick={() => _createConfiguration()}>CREATE CONFIG</button>
    <button onClick={() => fetch('/api/logout')}>LOGOUT</button>
    <a href="/api/login">Login!</a>
    {user.data && <pre>{JSON.stringify(user.data, null, 2)}</pre>}
    {!configurations.error && configurations.data && <pre>{JSON.stringify(configurations.data, null, 2)}</pre>}
    {/* <button onClick={() => _getCurrentUser()}>GET USER</button>
    <button onClick={() => _createUser()}>CREATE USER</button> */}
  </div>
}
