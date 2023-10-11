import styled from '@emotion/styled';
import { useHakitStore } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip } from '@hakit/components';
import { motion } from 'framer-motion';

const BreakPointButton = styled(motion.button)`
  background-color: var(--ha-S200);
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  height: 100%;
  aspect-ratio: 1/1;
  &:hover {
    background-color: var(--ha-S300);
  }
  &.active {
    background-color: var(--ha-S400);
  }
  > * {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export function BreakpointPreview() {
  const pages = useHakitStore(({ view }) => view?.pages ?? []);
  const currentPageId = useHakitStore(({ currentPageId }) => currentPageId);
  const setCurrentPageId = useHakitStore(({ setCurrentPageId }) => setCurrentPageId);
  return (<>
    {pages.filter(page => page.enabled).map((page, index) => {
      const active = page.id === currentPageId;
      return (<BreakPointButton key={index} className={active ? 'active' : ''} onClick={() => {
        setCurrentPageId(page.id);
      }}>
        <Tooltip title={`Edit ${page.name} Layout`} placement="right">
          <Icon icon={page.icon} />
        </Tooltip>
      </BreakPointButton>);
    })}
  </>);
}
