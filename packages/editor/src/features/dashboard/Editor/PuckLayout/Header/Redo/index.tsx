import { useGetPuck } from '@measured/puck';
import { Redo2Icon } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';

export function Redo() {
  const getPuck = useGetPuck();
  const { history } = getPuck();
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
