import styled from '@emotion/styled';
import { useHakitStore } from '@client/store';
import { PageConfig } from './PageConfig';
import { SaveConfig } from './SaveConfig';
import { WidgetPicker } from './WidgetPicker';
import { Row } from '@hakit/components';

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3rem;
  background-color: var(--ha-S100);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export function Header() {
  const mode = useHakitStore(store => store.mode);
  const isEditMode = mode === 'edit';
  return (
    <StyledHeader className="header">
      <PageConfig />
      <Row fullHeight gap={'0.1rem'}>
        <SaveConfig />
        <WidgetPicker />
      </Row>
    </StyledHeader>
  );
}
