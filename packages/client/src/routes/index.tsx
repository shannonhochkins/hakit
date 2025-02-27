import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { createUser, getCurrentUser, createConfiguration, getConfigurationByUser } from '../lib/api';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {


  const _getConfigurationByUser = useCallback(async () => {
    const config = await getConfigurationByUser({ userId: 1, userEmail: 'mail@shannonhochkins.com' })
    console.log('config', config);
  }, [])

  const _createConfiguration = useCallback(async () => {
    const config = await createConfiguration({
      value: {
        userId: 1,
        userEmail: 'mail@shannonhochkins.com',
        config: { something: 'true' }
      }
    })
    console.log('new config', config);
  }, [])

  const _getCurrentUser = useCallback(async () => {
    const user = await getCurrentUser('1', 'mail@shannonhochkins.com');
    console.log('user', user);
  }, [])

  const _createUser = useCallback(async () => {
    const user = await createUser({value: { email: 'mail@shannonhochkins.com', name: 'Shannon hochkins' }})
    console.log('new user', user);
  }, [])
  return <div>Hello &quot;/&quot;!
    <button onClick={() => _getConfigurationByUser()}>GET CONFIG</button>
    <button onClick={() => _createConfiguration()}>CREATE CONFIG</button>
    <button onClick={() => _getCurrentUser()}>GET USER</button>
    <button onClick={() => _createUser()}>CREATE USER</button>
  </div>
}
