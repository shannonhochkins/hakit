import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { Undo } from '@lib/components/IconButtons/Undo';
import { Redo } from '@lib/components/IconButtons/Redo';
import { Save } from '@lib/components/IconButtons/Save';
import { SaveAndPreview } from '@lib/components/IconButtons/Save/saveAndPreview';

const ActionBarWrapper = styled.div`
  border-bottom: 3px solid var(--puck-color-grey-05);
  color: var(--puck-color-black);
  width: 100%;
  padding: var(--space-4);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-height: var(--header-height);
  max-height: var(--header-height);
`;

export function ActionBar() {
  return (
    <ActionBarWrapper>
      <Row gap='1rem'>
        <Undo />
        <Redo />
      </Row>
      <Row gap='1rem'>
        <Save />
        <SaveAndPreview />
      </Row>
    </ActionBarWrapper>
  );
}
