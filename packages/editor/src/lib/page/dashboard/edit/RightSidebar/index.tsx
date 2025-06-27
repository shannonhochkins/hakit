import { PanelLeftIcon, PanelRightIcon, SettingsIcon } from "lucide-react";
import styled from '@emotion/styled';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';

// Styled Components
const CollapsedSidebar = styled.div`
  width: 40px;
  background-color: var(--color-gray-900);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2) 0;
`;

const ExpandedSidebar = styled.div`
  width: 288px;
  background-color: var(--color-gray-900);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`;

const IconButton = styled.button`
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

const CollapsedIconContainer = styled.div`
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SidebarHeader = styled.div`
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h3`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  margin: 0;
`;

const CollapseButton = styled.button`
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

const SidebarContent = styled.div`
  flex: 1;
  padding: var(--space-3);
  overflow-y: auto;
`;

export function RightSidebar() {
  const { rightSidebar, setRightSidebarCollapsed } = useEditorUIStore();
  const { isCollapsed } = rightSidebar;

  return (
    <>
      {isCollapsed ? (
        <CollapsedSidebar>
          <IconButton 
            onClick={() => setRightSidebarCollapsed(false)} 
            title="Expand properties"
          >
            <PanelLeftIcon size={18} />
          </IconButton>
          <CollapsedIconContainer>
            <IconButton title="Properties">
              <SettingsIcon size={18} />
            </IconButton>
          </CollapsedIconContainer>
        </CollapsedSidebar>
      ) : (
        <ExpandedSidebar>
          <SidebarHeader>
            <SidebarTitle>Properties</SidebarTitle>
            <CollapseButton
              onClick={() => setRightSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <PanelRightIcon size={16} />
            </CollapseButton>
          </SidebarHeader>
          <SidebarContent>
            {/* Properties content will go here */}
          </SidebarContent>
        </ExpandedSidebar>
      )}
    </>
  );
}