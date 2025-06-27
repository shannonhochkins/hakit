import { Settings, LayoutDashboard, MousePointerSquareDashed } from 'lucide-react';
import { Column } from '@hakit/components';
import { usePanel, type Panel } from '@lib/hooks/usePanel';
import styled from '@emotion/styled';

interface Tab {
  label: string;
  panel: Panel;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    label: 'Options',
    panel: 'options',
    icon: <Settings size={22} />,
  },
  {
    label: 'Components',
    panel: 'components',
    icon: <LayoutDashboard size={22} />,
  },
  {
    label: 'Component Tree',
    panel: 'tree',
    icon: <MousePointerSquareDashed size={22} />,
  },
];

const TabContainer = styled(Column)`
  border-left: 1px solid var(--color-gray-400);
  background-color: var(--color-gray-700);
`;

const TabButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-200);
  gap: 0.5rem;
  font-size: 1rem;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  outline: none;
  transform: scale(1) translate3d(0, 0, 0);
  transition: var(--transition-normal);
  transition-property: background-color, background-image;
  background-color: transparent;
  padding: 1rem;
  aspect-ratio: 1/1;
  label {
    font-size: 0.75rem;
    text-align: center;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 6px;
    color: currentColor;
  }
  &:disabled,
  &.disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
  &:not(.disabled):not(:disabled):hover,
  &.active {
    background-color: var(--color-gray-300);
    color: var(--color-gray-50);
    &:hover:not(.active) {
      background-color: var(--color-gray-400);
    }
  }
`;

export const Tabs = () => {
  const [panel, setPanel] = usePanel();

  return (
    <TabContainer fullHeight alignItems='stretch' justifyContent='flex-start'>
      {tabs.map(tab => (
        <TabButton key={tab.label} onClick={() => setPanel(tab.panel)} className={`sidebar-tab ${panel === tab.panel ? 'active' : ''}`}>
          <div className='icon'>{tab.icon}</div>
          <label>{tab.label}</label>
        </TabButton>
      ))}
    </TabContainer>
  );
};
