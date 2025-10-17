import { createFileRoute } from '@tanstack/react-router';
import { Renderer } from '@features/dashboard/Renderer';
import { PuckPreload } from '@features/dashboard/PuckPreload';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';
import { loadDashboardAndPageOrNotFound } from '../../loader';
import { NotFound } from '@features/404';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/')({
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    return await loadDashboardAndPageOrNotFound({
      queryClient,
      dashboardPath: params.dashboardPath,
      pagePath: params.pagePath,
    });
  },
  component: RouteComponent,
  notFoundComponent: NotFound,
});

function RouteComponent() {
  const { dashboard, page } = Route.useLoaderData();

  return (
    <RenderErrorBoundary prefix='Dashboard'>
      <PuckPreload dashboard={dashboard} page={page}>
        <Renderer />
      </PuckPreload>
    </RenderErrorBoundary>
  );
}
