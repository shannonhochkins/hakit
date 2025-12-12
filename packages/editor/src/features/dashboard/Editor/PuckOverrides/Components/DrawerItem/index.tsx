import { Column, Row } from '@components/Layout';
import { GripIcon } from 'lucide-react';
import styles from './DrawerItem.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { useComponentSearchStore } from '..';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { Tooltip } from '@components/Tooltip';
import { COMPONENT_TYPE_DELIMITER } from '@helpers/editor/pageData/constants';
const getClassName = getClassNameFactory('DrawerItem', styles);

type DrawerItemProps = { name: string };

export function DrawerItem({ name: addonName }: DrawerItemProps) {
  const name = addonName.split(COMPONENT_TYPE_DELIMITER)[0];
  const [proxiedComponents] = useLocalStorage<Record<string, string>>('proxied-components', {});
  const searchTerm = useComponentSearchStore(state => state.searchTerm);
  if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return <></>; // Hide if not matching
  return (
    <Tooltip
      title={proxiedComponents[addonName] ? `This component is proxied via module federation.` : undefined}
      style={{
        width: '100%',
      }}
    >
      <Row
        key={name}
        data-component-name={name}
        data-actual-name={addonName}
        draggable
        wrap='nowrap'
        fullWidth
        alignItems='center'
        justifyContent='start'
        className={getClassName({
          DrawerItem: true,
          proxied: !!proxiedComponents[addonName],
        })}
      >
        <div className={getClassName('DrawerItem-Icon')}>
          <GripIcon size={20} />
        </div>
        <Column fullWidth alignItems='start' gap={0} justifyContent='start'>
          <span className={getClassName('DrawerItem-Name')}>{name}</span>
        </Column>
      </Row>
    </Tooltip>
  );
}
