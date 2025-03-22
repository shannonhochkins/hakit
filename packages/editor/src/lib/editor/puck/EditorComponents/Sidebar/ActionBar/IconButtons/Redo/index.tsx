import { usePuck } from '@measured/puck';
import { Redo2Icon } from 'lucide-react';
import { StyledIconButton } from '../';

export function Redo() {
  const { history } = usePuck();
  const { hasFuture, forward } = history;
  return (
    <StyledIconButton title={hasFuture ? 'Redo' : 'No future history'} disabled={!hasFuture} onClick={forward}>
      <Redo2Icon size={21} />
    </StyledIconButton>
  );
}
