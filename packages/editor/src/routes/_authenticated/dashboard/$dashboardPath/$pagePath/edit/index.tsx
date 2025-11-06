import { createFileRoute } from '@tanstack/react-router';
import { Editor } from '@features/dashboard/Editor';
import { PuckPreload } from '@features/dashboard/PuckPreload';
import { RecoveryPrompt } from '@features/dashboard/Editor/RecoveryPrompt';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';
import { loadDashboardAndPageOrNotFound } from '@helpers/editor/routes/preload-data';
import { NotFound } from '@features/404';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/edit/')({
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
        <RecoveryPrompt>
          <Editor />
        </RecoveryPrompt>
      </PuckPreload>
    </RenderErrorBoundary>
  );
}
