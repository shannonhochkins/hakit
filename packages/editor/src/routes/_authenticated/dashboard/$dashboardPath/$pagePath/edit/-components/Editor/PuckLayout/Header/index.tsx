import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Undo } from './Undo';
import { Redo } from './Redo';
import { Save } from './Save';
import { Revert } from './Revert';
import { IconButton } from '@lib/components/Button/IconButton';
import { PageSelector } from './PageSelector';
import { FeatureText } from '@lib/components/FeatureText';
import { Divider } from '@mui/material';
import { PageForm } from '../../../PageForm';
import { useState } from 'react';
import { useDashboard } from '@lib/hooks/queeries/useDashboard';

// Styled Components
const StyledHeader = styled.header<{ $hidden?: boolean }>`
  background-color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--space-4);
  display: ${props => (props.$hidden ? 'none' : 'flex')};
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  flex-shrink: 0;
  flex-grow: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const UndoRedoGroup = styled.div`
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  gap: var(--space-1);
`;

export function Header() {
  const navigate = useNavigate();
  const [newPageOpen, setOpenNewPage] = useState(false);
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { data } = useDashboard(params.dashboardPath);
  const { isFullscreen } = useEditorUIStore();

  function handleBackToDashboards() {
    navigate({
      to: '/me/dashboards',
      replace: true,
    });
  }

  return (
    <StyledHeader $hidden={isFullscreen}>
      <HeaderLeft>
        <IconButton
          variant='transparent'
          icon={<ArrowLeftIcon size={18} />}
          onClick={handleBackToDashboards}
          tooltipProps={{ placement: 'right' }}
          aria-label='Back to dashboards'
        />
        <div>
          <FeatureText primary='@HAKIT' secondary='/EDITOR' />
        </div>
        <Divider orientation='vertical' flexItem />
        <PageControls>
          <PageSelector />
          <IconButton
            variant='transparent'
            tooltipProps={{
              placement: 'right',
            }}
            icon={<PlusIcon size={16} />}
            onClick={() => {
              setOpenNewPage(true);
            }}
            aria-label='Add new page'
          />
        </PageControls>
      </HeaderLeft>

      <HeaderRight>
        <UndoRedoGroup>
          <Undo />
          <Redo />
          <Revert />
        </UndoRedoGroup>

        <Save />
      </HeaderRight>
      <PageForm
        mode='new'
        dashboardId={data?.id}
        isOpen={newPageOpen}
        onClose={() => {
          setOpenNewPage(false);
        }}
        onSuccess={newPage => {
          console.log('newPage', newPage);
          navigate({
            to: '/dashboard/$dashboardPath/$pagePath/edit',
            // quickest pathway forward to load new data
            reloadDocument: true,
            params: {
              dashboardPath: params.dashboardPath,
              pagePath: newPage.path,
            },
          });
          setOpenNewPage(false);
        }}
      />
    </StyledHeader>
  );
}
