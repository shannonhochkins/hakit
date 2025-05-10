import { createUsePuck } from '@measured/puck';
import { Redo2Icon } from 'lucide-react';
import { IconButton } from '@lib/components/IconButtons';

const usePuck = createUsePuck();

export function Redo() {
  const history = usePuck(c => c.history);
  const { hasFuture, forward } = history;
  return (
    <IconButton title={hasFuture ? 'Redo' : 'No future history'} disabled={!hasFuture} onClick={forward}>
      <Redo2Icon size={21} />
    </IconButton>
  );
}
