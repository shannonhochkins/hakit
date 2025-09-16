import { IconButton } from '@components/Button/IconButton';
import { useGetPuck } from '@measured/puck';
import { Undo2Icon } from 'lucide-react';

export function Undo() {
  const getPuck = useGetPuck();
  const { history } = getPuck();
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
