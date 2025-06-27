import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { Undo } from '@lib/page/dashboard/edit/Header/Undo';
import { Redo } from '@lib/page/dashboard/edit/Header/Redo';
import { Save } from '@lib/page/dashboard/edit/Header/Save';
import { SaveAndPreview } from '@lib/page/dashboard/edit/Header/Save/saveAndPreview';

const ActionBarWrapper = styled.div`
  border-bottom: 3px solid var(--color-gray-400);
  color: var(--color-gray-950);
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
