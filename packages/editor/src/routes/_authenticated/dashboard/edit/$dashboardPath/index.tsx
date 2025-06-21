import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Dashboard } from '@lib/components/Dashboard';
import { Editor } from '@lib/components/Editor';
export const Route = createFileRoute(
  '/_authenticated/dashboard/edit/$dashboardPath/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);
  const params = Route.useParams();
  // get the path param from /editor:/id with tanstack router
  return <Dashboard mode="dashboard-edit" dashboardPath={params.dashboardPath}>
    <Editor />
  </Dashboard>;
}