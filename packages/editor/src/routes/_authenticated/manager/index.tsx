
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Dashboard } from '@lib/components/Dashboard';
import { Column, Row } from '@hakit/components';
import { OptionsSidebar } from '@lib/components/OptionsSidebar';
import { DashboardAndPageEditor } from '@lib/components/DashboardAndPageEditor';

export const Route = createFileRoute('/_authenticated/manager/')({
  component: RouteComponent,
})


function RouteComponent() {
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);
  // get the path param from /editor:/id with tanstack router
  return <DashboardAndPageEditor />
}