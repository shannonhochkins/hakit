import { createFileRoute } from '@tanstack/react-router';
import { Editor } from '@features/dashboard/Editor';
import { PuckPreload } from '@features/dashboard/PuckPreload';
import { RecoveryPrompt } from '@features/dashboard/Editor/RecoveryPrompt';
import { AssignPuckData } from '@features/dashboard/PuckAssignData';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/edit/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  return (
    <PuckPreload dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
      <RecoveryPrompt>
        <AssignPuckData dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
          <Editor />
        </AssignPuckData>
      </RecoveryPrompt>
    </PuckPreload>
  );
}
