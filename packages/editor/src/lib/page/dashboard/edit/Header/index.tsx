import { useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeftIcon, ExternalLinkIcon, PlusIcon, RedoIcon, SaveIcon, UndoIcon } from "lucide-react";
import styled from '@emotion/styled';

// Styled Components
const StyledHeader = styled.header`
  background-color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const BackButton = styled.button`
  padding: var(--space-2);
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
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-md);
`;

const UndoRedoButton = styled.button<{ position: 'left' | 'right' }>`
  padding: var(--space-2);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${props => props.position === 'left' ? 'var(--radius-md) 0 0 var(--radius-md)' : '0 var(--radius-md) var(--radius-md) 0'};
  
  &:hover {
    color: var(--color-text-primary);
  }
  
  &:disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-primary-base);
  
  &:hover {
    background: var(--gradient-primary-hover);
    box-shadow: var(--shadow-primary-hover);
  }
  
  &:active {
    background: var(--gradient-primary-active);
    box-shadow: var(--shadow-primary-active);
  }
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-success-600);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-success-700);
  }
  
  &:active {
    background-color: var(--color-success-800);
  }
`;

export function Header() {
  const navigate = useNavigate();
  const pages = [
    { id: 'page1', name: 'Page 1' },
    { id: 'page2', name: 'Page 2' },
    { id: 'page3', name: 'Page 3' },
  ];
  const editorParams = useParams({
      from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit',
      shouldThrow: false,
  });

  function handleBackToDashboards() {
    navigate({
      to: '/me/dashboards',
      replace: true,
    });
  }

  function handleViewDashboard() {
    if (!editorParams) return;
    navigate({
      to: '/dashboard/$dashboardPath/$pagePath',
      replace: true,
      params: {
        dashboardPath: editorParams?.dashboardPath,
        pagePath: editorParams?.pagePath,
      },
    });
  }

  return (
    <StyledHeader>
      <HeaderLeft>
        <BackButton onClick={handleBackToDashboards} aria-label="Back to dashboards">
          <ArrowLeftIcon size={18} />
        </BackButton>
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
          <UndoRedoButton position="left" title="Undo">
            <UndoIcon size={16} />
          </UndoRedoButton>
          <UndoRedoButton position="right" title="Redo">
            <RedoIcon size={16} />
          </UndoRedoButton>
        </UndoRedoGroup>
        
        <SaveButton title="Save">
          <SaveIcon size={16} />
          <span>Save</span>
        </SaveButton>
        
        {editorParams && (
          <ViewButton onClick={handleViewDashboard} title="Save and View Dashboard">
            <ExternalLinkIcon size={16} />
            <span>View</span>
          </ViewButton>
        )}
      </HeaderRight>
    </StyledHeader>
  );
}