import { usePuck } from '@measured/puck';
import { Undo2Icon } from 'lucide-react';
import { StyledIconButton } from '../';

export function Undo() {
  const { history } = usePuck();
  const { hasPast, back } = history;
  return (
    <StyledIconButton title={hasPast ? 'Undo' : 'No previous history'} disabled={!hasPast} onClick={back}>
      <Undo2Icon size={21} />
    </StyledIconButton>
  );
}
