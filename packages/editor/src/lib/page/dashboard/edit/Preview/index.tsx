import { Puck } from '@measured/puck';
import { Column } from '@hakit/components';
import styled from '@emotion/styled';

const CanvasWrapper = styled(Column)`
  width: 100%;
  max-width: 100%;
  padding: var(--space-4);
  /* outline: 2px dashed var(--color-gray-500); */
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
