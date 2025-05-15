import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { DashboardSelector } from '@lib/components/DashboardSelector';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';

export const Route = createFileRoute('/_authenticated/dashboards/')({
  component: RouteComponent,
});

function RouteComponent() {
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);
  // get the path param from /editor:/id with tanstack router
  return <DashboardSelector open onClose={() => {

  }} />;
}