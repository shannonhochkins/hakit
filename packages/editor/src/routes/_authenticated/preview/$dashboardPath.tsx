import { createFileRoute } from '@tanstack/react-router'
import { Renderer } from '@editor/puck/Renderer';
import { Dashboard } from '@client/src/lib/Dashboard';

export const Route = createFileRoute('/_authenticated/preview/$dashboardPath')({
  component: RouteComponent,
})

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  return <Dashboard dashboardPath={params.dashboardPath}>
    <Renderer />
  </Dashboard>;
}
