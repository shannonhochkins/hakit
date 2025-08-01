import { Fab, type FabProps } from './Fab';

interface IconButtonProps extends Omit<FabProps, 'children'> {
  active?: boolean;
}

export function IconButton({ ...rest }: IconButtonProps) {
  return <Fab className={`icon-button ${rest.className || ''}`} size='sm' borderRadius='var(--radius-md)' variant='secondary' {...rest} />;
}
