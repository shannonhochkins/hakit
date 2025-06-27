import { BoxIcon, Layers2Icon, PanelLeftIcon, PanelRightIcon, SearchIcon } from "lucide-react";
import styled from '@emotion/styled';
import { Tabs, Tab } from '@mui/material';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Puck } from "@measured/puck";

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

const IconButton = styled.button<{ isActive?: boolean }>`
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: ${props => props.isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)'};
  background-color: ${props => props.isActive ? 'var(--color-primary-600)' : 'transparent'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--color-text-primary);
    background-color: ${props => props.isActive ? 'var(--color-primary-600)' : 'var(--color-border)'};
  }
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

const CollapseButton = styled.button`
  padding: var(--space-2);
  margin-right: var(--space-1);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border);
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SearchContainer = styled.div`
  padding: var(--space-3);
`;

const SearchInputWrapper = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) 36px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  
  &::placeholder {
    color: var(--color-text-muted);
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: var(--shadow-primary-focus);
  }
`;

const SearchIconStyled = styled(SearchIcon)`
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
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
    setLeftSidebarSearchQuery,
  } = useEditorUIStore();

  const { isCollapsed, activeTab, searchQuery } = leftSidebar;

  // const filteredComponents = [
  //   { id: '1', name: 'Button', icon: <button style={{ padding: '8px', backgroundColor: 'var(--color-primary-500)', color: 'white', borderRadius: '4px', border: 'none' }}>Button</button>, thumbnail: null },
  //   { id: '2', name: 'Input', icon: <input type="text" style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'transparent', color: 'var(--color-text-primary)' }} placeholder="Input" />, thumbnail: null },
  //   { id: '3', name: 'Card', icon: <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-elevated)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-text-primary)' }}>Card</div>, thumbnail: null },
  //   { id: '4', name: 'Modal', icon: <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-text-primary)' }}>Modal</div>, thumbnail: null },
  //   { id: '5', name: 'Dropdown', icon: <div style={{ padding: '8px', backgroundColor: 'var(--color-gray-700)', color: 'white', borderRadius: '4px', fontSize: '12px' }}>Dropdown</div>, thumbnail: null },
  // ].filter(component => 
  //   component.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  // );

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setLeftSidebarTab(newValue as 'components' | 'outline');
  };

  return (
    <>
      {isCollapsed ? (
        <CollapsedSidebar>
          <IconButton 
            onClick={() => setLeftSidebarCollapsed(false)} 
            title="Expand sidebar"
          >
            <PanelRightIcon size={18} />
          </IconButton>
          <CollapsedIconContainer>
            <IconButton
              isActive={activeTab === 'components'}
              onClick={() => {
                setLeftSidebarCollapsed(false);
                setLeftSidebarTab('components');
              }}
              title="Components"
            >
              <BoxIcon size={18} />
            </IconButton>
            <IconButton
              isActive={activeTab === 'outline'}
              onClick={() => {
                setLeftSidebarCollapsed(false);
                setLeftSidebarTab('outline');
              }}
              title="Outline"
            >
              <Layers2Icon size={18} />
            </IconButton>
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
            <CollapseButton
              onClick={() => setLeftSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <PanelLeftIcon size={16} />
            </CollapseButton>
          </SidebarHeader>

          {activeTab === 'components' && (
            <TabContent>
              <SearchContainer>
                <SearchInputWrapper>
                  <SearchIconStyled size={16} />
                  <SearchInput
                    type="text"
                    placeholder="Search components..."
                    value={searchQuery}
                    onChange={(e) => setLeftSidebarSearchQuery(e.target.value)}
                  />
                </SearchInputWrapper>
              </SearchContainer>
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