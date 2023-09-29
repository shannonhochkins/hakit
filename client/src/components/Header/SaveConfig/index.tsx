import styled from '@emotion/styled';
import { useHakitStore } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip } from '@hakit/components';
import { motion } from 'framer-motion';
import { useWriteFile } from '@client/hooks';

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
  aspect-ratio: 1/1;
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
  const pages = useHakitStore(({ pages }) => pages);
  const writeFile = useWriteFile();
  return (<>
    <PageContainer>
      <SaveWidgetButton onClick={() => {
        void(async () => {
          await writeFile({
            filename: 'config.json',
            content: JSON.stringify(pages, null, 2),
          });
        })();
      }}>
        <Tooltip title="Save Layouts" placement="left">
          <Icon icon="mdi:content-save" />
        </Tooltip>
      </SaveWidgetButton>
    </PageContainer>
  </>);
}
