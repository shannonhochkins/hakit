import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import styled from '@emotion/styled';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Undo } from "./Undo";
import { Redo } from "./Redo";
import { Save } from "./Save";
import { SaveAndPreview } from "./Save/saveAndPreview";
import { IconButton } from "@lib/page/shared/Button/IconButton";

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

const PageSelect = styled.select`
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-border-hover);
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: var(--shadow-primary-focus);
  }
`;

const AddPageButton = styled.button`
  padding: var(--space-1);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border);
  }
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
  
  const pages = [
    { id: 'page1', name: 'Page 1' },
    { id: 'page2', name: 'Page 2' },
    { id: 'page3', name: 'Page 3' },
  ];

  function handleBackToDashboards() {
    navigate({
      to: '/me/dashboards',
      replace: true,
    });
  }


  return (
    <StyledHeader $hidden={isFullscreen}>
      <HeaderLeft>
        <IconButton icon={<ArrowLeftIcon size={18} />} onClick={handleBackToDashboards} aria-label="Back to dashboards" />
        <PageControls>
          <PageSelect>
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </PageSelect>
          <AddPageButton aria-label="Add new page">
            <PlusIcon size={16} />
          </AddPageButton>
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