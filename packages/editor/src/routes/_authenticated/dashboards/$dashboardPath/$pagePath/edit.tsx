import { createFileRoute } from '@tanstack/react-router'
import { Editor } from '@lib/components/Editor';
import { Dashboard } from '@lib/components/Dashboard';

export const Route = createFileRoute('/_authenticated/dashboards/$dashboardPath/$pagePath/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  return <Dashboard dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
    <Editor />
  </Dashboard>;
}
