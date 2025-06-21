import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Dashboard } from '@lib/components/Dashboard';
import { Editor } from '@lib/components/Editor';
import { Column, Row } from '@hakit/components';
import { NavigationSidebar } from '@lib/components/NavigationSidebar';
import { OptionsSidebar } from '@lib/components/OptionsSidebar';
import { DashboardAndPageEditor } from '@lib/components/DashboardAndPageEditor';

export const Route = createFileRoute('/_authenticated/dashboard/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);
  // get the path param from /editor:/id with tanstack router
  return <Dashboard mode="dashboard-new">
    <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
      <Row fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px' data-floating-panel-restriction>
        <Column
          fullWidth
          fullHeight
          alignItems='stretch'
          justifyContent='stretch'
          wrap='nowrap'
          gap='0px'
          style={{
            flex: '1 1 0',
            minWidth: 0,
          }}
        >
          <Row justifyContent='space-between' alignItems='center' gap='0px' style={{
            padding: '0 var(--puck-space-px)'
          }}>
            <Row gap="0.5rem">
              <DashboardAndPageEditor />
            </Row>
          </Row>
        </Column>
        <OptionsSidebar />
      </Row>
    </Column>
  </Dashboard>;
}