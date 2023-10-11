import styled from '@emotion/styled';
import { useHakitStore } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip, Row } from '@hakit/components';
import { motion } from 'framer-motion';
import { useSaveConfiguration } from '@client/hooks';

const PageContainer = styled.div`
  position: relative;
  height: 100%;
`;

const SaveWidgetButton = styled(motion.button)`
  background-color: var(--ha-S400);
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  height: 100%;
  &:hover {
    background-color: var(--ha-S500);
  }
  &.active {
    background-color: var(--ha-S600);
  }
  > * {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export function SaveConfig() {
  const setMode = useHakitStore(store => store.setMode);
  const saveConfiguration = useSaveConfiguration();
  return (<>
    <PageContainer>
      <SaveWidgetButton onClick={() => {
        void saveConfiguration();
        setMode('live');
      }}>
        <Tooltip title="Save Layouts" placement="left">
          <Row fullWidth fullHeight gap="0.5rem" style={{
            padding: '0.5rem'
          }}>
            <Icon icon="mdi:content-save" style={{
              fontSize: '1.1rem'
            }} />
            SAVE
          </Row>
        </Tooltip>
      </SaveWidgetButton>
    </PageContainer>
  </>);
}
