import { Redo2Icon } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';
import { createUsePuck } from '@measured/puck';

const usePuck = createUsePuck();

export function Redo() {
  const history = usePuck(state => state.history);
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
