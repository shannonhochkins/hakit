import { createFileRoute } from '@tanstack/react-router';
import { Editor } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/edit/-components/Editor';
import { PreloadPuck } from '../-components/PreloadPuck';
import { RecoveryPrompt } from './-components/Editor/RecoveryPrompt';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/edit/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  return (
    <PreloadPuck dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
      <RecoveryPrompt>
        <Editor />
      </RecoveryPrompt>
    </PreloadPuck>
  );
}
