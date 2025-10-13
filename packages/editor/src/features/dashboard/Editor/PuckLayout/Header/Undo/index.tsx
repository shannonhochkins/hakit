import { IconButton } from '@components/Button/IconButton';
import { Undo2Icon } from 'lucide-react';
import { createUsePuck } from '@measured/puck';

const usePuck = createUsePuck();

export function Undo() {
  const history = usePuck(state => state.history);
  const { hasPast, back } = history;
  return (
    <IconButton
      variant='transparent'
      tooltipProps={{
        placement: 'bottom',
      }}
      active={hasPast}
      icon={<Undo2Icon size={21} />}
      aria-label={hasPast ? 'Undo' : 'No previous history'}
      disabled={!hasPast}
      onClick={back}
    />
  );
}
