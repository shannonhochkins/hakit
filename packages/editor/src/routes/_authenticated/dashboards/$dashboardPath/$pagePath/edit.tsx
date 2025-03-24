import { createFileRoute } from '@tanstack/react-router'
import { Editor } from '@editor/puck/Editor';
import { Dashboard } from '@client/src/lib/Dashboard';

export const Route = createFileRoute('/_authenticated/dashboards/$dashboardPath/$pagePath/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  return <Dashboard dashboardPath={params.dashboardPath}>
    {/* <ColourTesting /> */}
    <Editor />
  </Dashboard>;
}
