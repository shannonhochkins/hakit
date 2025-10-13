import { createFileRoute } from '@tanstack/react-router';
import { Renderer } from '@features/dashboard/Renderer';
import { PuckPreload } from '@features/dashboard/PuckPreload';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();

  return (
    <RenderErrorBoundary prefix='Editor Dashboard'>
      <PuckPreload dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
        <Renderer />
      </PuckPreload>
    </RenderErrorBoundary>
  );
}
