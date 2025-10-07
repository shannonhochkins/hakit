import { createFileRoute } from '@tanstack/react-router';
import { Editor } from '@features/dashboard/Editor';
import { PuckPreload } from '@features/dashboard/PuckPreload';
import { RecoveryPrompt } from '@features/dashboard/Editor/RecoveryPrompt';
import { AssignPuckData } from '@features/dashboard/PuckAssignData';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/edit/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();

  return (
    <RenderErrorBoundary prefix='Dashboard'>
      <PuckPreload dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
        <RecoveryPrompt>
          <AssignPuckData dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
            <Editor />
          </AssignPuckData>
        </RecoveryPrompt>
      </PuckPreload>
    </RenderErrorBoundary>
  );
}
