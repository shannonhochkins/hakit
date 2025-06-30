import { createUsePuck } from '@measured/puck';
import { Redo2Icon } from 'lucide-react';
import { IconButton } from '@lib/components/Button/IconButton';

const usePuck = createUsePuck();

export function Redo() {
  const history = usePuck(c => c.history);
  const { hasFuture, forward } = history;
  return (
    <IconButton
      tooltipProps={{
        placement: 'bottom',
      }}
      variant='transparent'
      active={hasFuture}
      icon={<Redo2Icon size={21} />}
      aria-label={hasFuture ? 'Redo' : 'No future history'}
      disabled={!hasFuture}
      onClick={forward}
    />
  );
}
