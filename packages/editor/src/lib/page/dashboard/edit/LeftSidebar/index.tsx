import { BoxIcon, Layers2Icon, PanelLeftIcon, PanelRightIcon } from "lucide-react";
import styled from '@emotion/styled';
import { Tabs, Tab } from '@mui/material';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Puck } from "@measured/puck";
import { IconButton } from "@lib/page/shared/Button/IconButton";

const CollapsedSidebar = styled.div`
  width: 40px;
  flex-shrink: 0;
  background-color: var(--color-gray-900);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2) 0;
`;

const ExpandedSidebar = styled.div`
  width: 256px;
  flex-shrink: 0;
  flex-grow: 0;
  background-color: var(--color-gray-900);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`;



const CollapsedIconContainer = styled.div`
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
  flex-grow: 0;
  flex-shrink: 0;
`;

const StyledTabs = styled(Tabs)`
  flex: 1;
  min-height: auto;
  
  .MuiTabs-flexContainer {
    height: 100%;
  }
  
  .MuiTab-root {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    text-transform: none;
    min-height: auto;
    
    &:hover {
      color: var(--color-text-primary);
    }
    
    &.Mui-selected {
      color: var(--color-text-primary);
    }
  }
  
  .MuiTabs-indicator {
    height: 2px;
    background-color: var(--color-primary-500);
  }
`;


const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ComponentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;


const OutlineContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
`;

export function LeftSidebar() {
  const {
    leftSidebar,
    setLeftSidebarCollapsed,
    setLeftSidebarTab,
  } = useEditorUIStore();

  const { isCollapsed, activeTab } = leftSidebar;

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setLeftSidebarTab(newValue as 'components' | 'outline');
  };

  return (
    <>
      {isCollapsed ? (
        <CollapsedSidebar>
          <IconButton 
            onClick={() => setLeftSidebarCollapsed(false)} 
            aria-label="Expand sidebar"
            variant="transparent"
            icon={<PanelRightIcon size={18} />}
          />
            
          <CollapsedIconContainer>
            <IconButton
              variant="transparent"
              active={activeTab === 'components'}
              onClick={() => {
                setLeftSidebarCollapsed(false);
                setLeftSidebarTab('components');
              }}
              aria-label="Components"
              icon={<BoxIcon size={18} />}
            >
              
            </IconButton>
            <IconButton
              variant="transparent"
              active={activeTab === 'outline'}
              onClick={() => {
                setLeftSidebarCollapsed(false);
                setLeftSidebarTab('outline');
              }}
              aria-label="Outline"
              icon={<Layers2Icon size={18} />}
            />
          </CollapsedIconContainer>
        </CollapsedSidebar>
      ) : (
        <ExpandedSidebar>
          <SidebarHeader>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Components" value="components" />
              <Tab label="Outline" value="outline" />
            </StyledTabs>
            <IconButton
              variant="transparent"
              icon={<PanelLeftIcon size={16} />}
              onClick={() => setLeftSidebarCollapsed(true)}
              aria-label="Collapse sidebar"
            />
          </SidebarHeader>

          {activeTab === 'components' && (
            <TabContent>
              <ComponentsList>
                <Puck.Components />
              </ComponentsList>
            </TabContent>
          )}

          {activeTab === 'outline' && (
            <OutlineContent>
              <Puck.Outline />
            </OutlineContent>
          )}
        </ExpandedSidebar>
      )}
    </>
  );
}