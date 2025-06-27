import { IconButton } from '@lib/page/shared/Button/IconButton';
import { createUsePuck } from '@measured/puck';
import { Undo2Icon } from 'lucide-react';

const usePuck = createUsePuck();

export function Undo() {
  const history = usePuck(c => c.history);
  const { hasPast, back } = history;
  return (
    <IconButton
      variant="transparent"
      tooltipProps={{
        placement: 'bottom'
      }}
      active={hasPast}
      icon={<Undo2Icon size={21} />}
      aria-label={hasPast ? 'Undo' : 'No previous history'}
      disabled={!hasPast}
      onClick={back} />
  );
}
