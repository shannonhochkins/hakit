import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import styled from '@emotion/styled';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Undo } from "./Undo";
import { Redo } from "./Redo";
import { Save } from "./Save";
import { SaveAndPreview } from "./Save/saveAndPreview";
import { IconButton } from "@lib/page/shared/Button/IconButton";
import { PageSelector } from "./PageSelector";

// Styled Components
const StyledHeader = styled.header<{ $hidden?: boolean }>`
  background-color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--space-4);
  display: ${props => props.$hidden ? 'none' : 'flex'};
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
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
  gap: var(--space-2);
`;

export function Header() {
  const navigate = useNavigate();
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
          variant="transparent"
          icon={<ArrowLeftIcon size={18} />}
          onClick={handleBackToDashboards}
          tooltipProps={{ placement: 'right' }}
          aria-label="Back to dashboards" />
        <PageControls>
          <PageSelector />
          <IconButton
            variant="transparent"
            tooltipProps={{
              placement: 'right'
            }}
            icon={<PlusIcon size={16} />}
            aria-label="BAdd new page" />
        </PageControls>
      </HeaderLeft>
      
      <HeaderRight>
        <UndoRedoGroup>
          <Undo />
          <Redo />
        </UndoRedoGroup>
        
        <Save />
        <SaveAndPreview />
      </HeaderRight>
    </StyledHeader>
  );
}