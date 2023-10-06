import styled from '@emotion/styled';
import { useHakitStore } from '@client/store';
import { PageConfig } from './PageConfig';
import { SaveConfig } from './SaveConfig';
import { WidgetPicker } from '../WidgetPicker';
import { BreakpointPreview } from './BreakpointPreview';
import { Row, FabCard } from '@hakit/components';

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--ha-header-height);
  background-color: var(--ha-S100);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledFabCard = styled(FabCard)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  opacity: 0.4;
  transition: opacity var(--ha-transition-duration) var(--ha-easing);
  &:hover, &:active, &:focus {
    opacity: 1;
  }
`;

export function Header() {
  const mode = useHakitStore(store => store.mode);
  const setMode = useHakitStore(store => store.setMode);
  const isEditMode = mode === 'edit';
  if (!isEditMode) {
    return (<StyledFabCard icon="mdi:edit" onClick={() => setMode('edit')} />);
  }
  return (
    <StyledHeader className="header">
      <PageConfig />
      <Row fullHeight>
        <BreakpointPreview />
      </Row>
      <Row fullHeight gap={'0.1rem'}>
        <SaveConfig />
        <WidgetPicker />
      </Row>
    </StyledHeader>
  );
}
