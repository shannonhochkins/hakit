import { Puck } from '@measured/puck';
import { Row } from '@hakit/components';
import styled from '@emotion/styled';

const CanvasWrapper = styled(Row)`
  width: 100%;
  max-width: 100%;
  padding: var(--space-4);
  /* outline: 2px dashed var(--puck-color-grey-06); */
  /* outline-offset: 2px; */
  border-radius: 4px;
`;

export function Preview() {
  return (
    <CanvasWrapper fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
      <Puck.Preview />
    </CanvasWrapper>
  );
}
