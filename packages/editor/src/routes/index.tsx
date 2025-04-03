import { createFileRoute } from '@tanstack/react-router'
import { userQueryOptions } from '../lib/api/user';
import { useQuery } from '@tanstack/react-query';


export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useQuery(userQueryOptions);
  

  return <div>
    {user.data && <button onClick={() => fetch('/api/logout')}>LOGOUT</button>}
    {!user.data && <a href="/api/login">Login!</a>}
    {user.data && <pre>{JSON.stringify(user.data, null, 2)}</pre>}
  </div>
}
