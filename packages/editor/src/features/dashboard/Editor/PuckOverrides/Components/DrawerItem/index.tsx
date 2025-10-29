import { Column, Row } from '@components/Layout';
import { GripIcon } from 'lucide-react';
import styles from './DrawerItem.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { useComponentSearchStore } from '..';
const getClassName = getClassNameFactory('DrawerItem', styles);

type DrawerItemProps = { name: string };

export function DrawerItem({ name }: DrawerItemProps) {
  const searchTerm = useComponentSearchStore(state => state.searchTerm);
  if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return <></>; // Hide if not matching
  return (
    <Row
      key={name}
      data-component-name={name}
      draggable
      wrap='nowrap'
      fullWidth
      alignItems='center'
      justifyContent='start'
      className={getClassName('DrawerItem')}
    >
      <div className={getClassName('DrawerItem-Icon')}>
        <GripIcon size={20} />
      </div>
      <Column fullWidth alignItems='start' gap={0} justifyContent='start'>
        <span className={getClassName('DrawerItem-Name')}>{name}</span>
      </Column>
    </Row>
  );
}
