import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { userQueryOptions } from '../lib/api';
import { createConfiguration, configQueryOptions, getConfigurationForUser, getConfigurationsForUser } from '../lib/api/configuration';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useQuery(userQueryOptions);
  const configurations = useQuery(configQueryOptions);
  const navigate = useNavigate();

  const _getConfigurationForUser = useCallback(async (id: number) => {
    const config = await getConfigurationForUser(id);
    console.log('config', config);
  }, [])

  const _getConfigurationsForUser = useCallback(async () => {
    const config = await getConfigurationsForUser();
    console.log('config', config);
  }, [])

  const _createConfiguration = useCallback(async () => {
    if (!user.data) return;
    const config = await createConfiguration()
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
    {configurations.data && configurations.isSuccess && Array.isArray(configurations.data) && configurations.data.map((config) => {
      return <button key={config.id} onClick={() => {
        _getConfigurationForUser(config.id);
      }}>{config.name}</button>
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
