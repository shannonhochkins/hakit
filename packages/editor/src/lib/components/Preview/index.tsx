import { Puck } from '@measured/puck';
import { Row } from '@hakit/components';
import styled from '@emotion/styled';
import { SIDEBAR_PANEL_WIDTH } from '@lib/constants';

const CanvasWrapper = styled(Row)`
  width: calc(100vw - var(--sidebar-panel-width, ${SIDEBAR_PANEL_WIDTH}px) - 32px);
  max-width: 100%;
  margin: var(--puck-space-px);
  outline: 2px dashed var(--puck-color-grey-06);
  outline-offset: 2px;
  border-radius: 4px;
`;

export function Preview() {
  return (
    <CanvasWrapper fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
      <Puck.Preview />
    </CanvasWrapper>
  );
}
