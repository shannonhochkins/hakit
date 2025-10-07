import { BoxIcon, Layers2Icon, PanelLeftIcon, PanelRightIcon } from 'lucide-react';
import styles from './LeftSidebar.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const getClassName = getClassNameFactory('LeftSidebar', styles);
import { Tabs } from '@components/Tabs';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { Puck } from '@measured/puck';
import { IconButton } from '@components/Button/IconButton';
import React, { useCallback } from 'react';

const CollapsedSidebar = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={getClassName('collapsedSidebar', props.className)} />
);

const ExpandedSidebar = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={getClassName('expandedSidebar', props.className)} />
);

const CollapsedIconContainer = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={getClassName('collapsedIconContainer', props.className)} />
);

const SidebarHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={getClassName('header', props.className)} />
);

const ComponentsList = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={getClassName('componentsList', props.className)} />
);

const OutlineContent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={getClassName('outlineContent', props.className)} />
);

export function LeftSidebar({ onToggle }: { onToggle: (collapsed: boolean) => void }) {
  const { leftSidebar, setLeftSidebarCollapsed, setLeftSidebarTab } = useEditorUIStore();

  const { isCollapsed, activeTab } = leftSidebar;

  const onClickCollapseSidebar = useCallback(() => {
    setLeftSidebarCollapsed(true);
    onToggle(true);
  }, [setLeftSidebarCollapsed, onToggle]);

  const onClickExpandSidebar = useCallback(() => {
    setLeftSidebarCollapsed(false);
    onToggle(false);
  }, [setLeftSidebarCollapsed, onToggle]);

  const onClickComponentsTab = useCallback(() => {
    setLeftSidebarTab('components');
    setLeftSidebarCollapsed(false);
  }, [setLeftSidebarTab, setLeftSidebarCollapsed]);

  const onClickOutlineTab = useCallback(() => {
    setLeftSidebarTab('outline');
    setLeftSidebarCollapsed(false);
  }, [setLeftSidebarTab, setLeftSidebarCollapsed]);

  const handleTabChange = useCallback(
    (newValue: string) => {
      setLeftSidebarTab(newValue as 'components' | 'outline');
    },
    [setLeftSidebarTab]
  );

  return (
    <>
      {isCollapsed ? (
        <CollapsedSidebar>
          <IconButton
            onClick={onClickExpandSidebar}
            aria-label='Expand sidebar'
            variant='transparent'
            icon={<PanelRightIcon size={18} />}
          />

          <CollapsedIconContainer>
            <IconButton
              variant='transparent'
              active={activeTab === 'components'}
              onClick={onClickComponentsTab}
              aria-label='Components'
              icon={<BoxIcon size={18} />}
            ></IconButton>
            <IconButton
              variant='transparent'
              active={activeTab === 'outline'}
              onClick={onClickOutlineTab}
              aria-label='Outline'
              icon={<Layers2Icon size={18} />}
            />
          </CollapsedIconContainer>
        </CollapsedSidebar>
      ) : (
        <ExpandedSidebar>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <SidebarHeader>
              <Tabs.List fluid>
                <Tabs.Control value='components'>Components</Tabs.Control>
                <Tabs.Control value='outline'>Outline</Tabs.Control>
              </Tabs.List>
              <IconButton
                variant='transparent'
                icon={<PanelLeftIcon size={16} />}
                onClick={onClickCollapseSidebar}
                aria-label='Collapse sidebar'
              />
            </SidebarHeader>

            <Tabs.Content>
              <Tabs.Panel value='components'>
                <ComponentsList>
                  <Puck.Components />
                </ComponentsList>
              </Tabs.Panel>
              <Tabs.Panel value='outline'>
                <OutlineContent>
                  <Puck.Outline />
                </OutlineContent>
              </Tabs.Panel>
            </Tabs.Content>
          </Tabs>
        </ExpandedSidebar>
      )}
    </>
  );
}
