import { createUsePuck } from '@measured/puck';
import { Undo2Icon } from 'lucide-react';
import { IconButton } from '@lib/components/IconButtons';

const usePuck = createUsePuck();

export function Undo() {
  const history = usePuck(c => c.history);
  const { hasPast, back } = history;
  return (
    <IconButton title={hasPast ? 'Undo' : 'No previous history'} disabled={!hasPast} onClick={back}>
      <Undo2Icon size={21} />
    </IconButton>
  );
}
