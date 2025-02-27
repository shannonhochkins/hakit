import styled from '@emotion/styled';
import {} from 'lucide-react';
import { ReactNode } from 'react';
import { Settings, LayoutDashboard, MousePointerSquareDashed } from 'lucide-react';
import { Row } from '@hakit/components';
import { usePanel, Panel } from '@editor/hooks/usePanel';
import { HEADER_HEIGHT } from '@editor/constants';

const StyledNavBar = styled.nav`
  width: 100%;
  padding: 1rem;
  background: var(--panel-background-color);
  box-sizing: border-box;
  height: ${HEADER_HEIGHT}px;
`;

type Action = {
  label: string;
  icon: ReactNode;
  panel: Panel;
  onClick: (setPanel: (panel: Panel) => void) => void;
};

const actions: Action[] = [
  {
    label: 'Options',
    panel: 'options',
    icon: <Settings size={18} />,
    onClick: setPanel => {
      setPanel('options');
    },
  },
  {
    label: 'Components',
    panel: 'components',
    icon: <LayoutDashboard size={18} />,
    onClick: setPanel => {
      setPanel('components');
    },
  },
  {
    label: 'Layout',
    panel: 'outline',
    icon: <MousePointerSquareDashed size={18} />,
    onClick: setPanel => {
      setPanel('outline');
    },
  },
];

const Actions = styled(Row)``;

const ActionButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--puck-color-grey-01);
  gap: 1rem;
  font-size: 1rem;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  outline: none;
  transform: scale(1) translate3d(0, 0, 0);
  transition: var(--transition-duration) var(--easing);
  transition-property: background-color, background-image;
  flex-shrink: 1;
  background-color: transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  svg {
    color: var(--panel-background-color);
  }
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--puck-color-grey-01);
    padding: 4px;
    border-radius: 6px;
  }
  &:disabled,
  &.disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
  &:not(.disabled):not(:disabled):hover,
  &.active,
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--puck-color-grey-01);
  }
`;

export function NavBar() {
  const [currentPanel, setPanel] = usePanel();
  return (
    <StyledNavBar>
      <Actions gap='1rem'>
        {actions.map(({ label, icon, onClick, panel }) => (
          <ActionButton key={label} onClick={() => onClick(setPanel)} className={currentPanel === panel ? 'active' : ''}>
            <div className='icon'>{icon}</div>
            {label}
          </ActionButton>
        ))}
      </Actions>
    </StyledNavBar>
  );
}
