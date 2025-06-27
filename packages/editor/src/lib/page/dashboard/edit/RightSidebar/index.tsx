import { PanelLeftIcon, PanelRightIcon } from "lucide-react";
import styled from '@emotion/styled';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Puck, createUsePuck } from '@measured/puck';
import { usePuckSelectedItem } from '@lib/hooks/usePuckSelectedItem';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Fab } from "@lib/page/shared/Button";

const usePuck = createUsePuck();

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
  width: 400px;
  flex-shrink: 0;
  flex-grow: 0;
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


const SidebarHeader = styled.div`
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-2);
`;

const SidebarTitle = styled.h3`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
`;



const SidebarContent = styled.div`
  flex: 1;
  padding: var(--space-3);
  overflow-y: auto;
`;

export function RightSidebar() {
  const { rightSidebar, setRightSidebarCollapsed } = useEditorUIStore();
  const { isCollapsed } = rightSidebar;
  const selectedItem = usePuckSelectedItem();
  const dispatch = usePuck(c => c.dispatch);
  const deselect = useCallback(() => {
    dispatch({
      type: 'setUi',
      ui: { itemSelector: null },
      recordHistory: true,
    });
  }, [dispatch]);

  const tabHeading = selectedItem ? `${selectedItem.type.split('::')[1]} Options` : 'Global Options';

  return (
    <>
      {isCollapsed ? (
        <CollapsedSidebar>
          <Fab 
            onClick={() => setRightSidebarCollapsed(false)} 
            size="sm"
            borderRadius="var(--radius-md)"            variant="transparent"
            icon={<PanelLeftIcon size={18} />}
            aria-label="Expand properties"
          />
        </CollapsedSidebar>
      ) : (
        <ExpandedSidebar>
          <SidebarHeader>
            <Fab 
              onClick={() => setRightSidebarCollapsed(true)} 
              size="sm"
              borderRadius="var(--radius-md)"
              variant="transparent"
              icon={<PanelRightIcon size={16} />}
              aria-label="Collapse properties"
            />
            <SidebarTitle>
              {tabHeading}
              {selectedItem && (
                <Tooltip title="Deselect Component" placement="left">
                  <IconButton onClick={deselect}>
                    <X size={16} />   
                  </IconButton>
                </Tooltip>
              )}
            </SidebarTitle>
          </SidebarHeader>
          <SidebarContent>
            {selectedItem ? (<Puck.Fields />) : (<Puck.Fields wrapFields={false} />)}
          </SidebarContent>
        </ExpandedSidebar>
      )}
    </>
  );
}