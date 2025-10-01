import { Column, Row } from '@components/Layout';
import { GripIcon } from 'lucide-react';
import styles from './DrawerItem.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const getClassName = getClassNameFactory('DrawerItem', styles);

type DrawerItemProps = { name: string };

// const ComponentThumbnail = styled.div`
//   margin-left: auto;
//   width: 40px;
//   height: 24px;
//   border-radius: var(--radius-sm);
//   overflow: hidden;

//   img {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//   }
// `;

export function DrawerItem({ name }: DrawerItemProps) {
  return (
    <Row key={name} draggable wrap='nowrap' fullWidth alignItems='center' justifyContent='start' className={getClassName('DrawerItem')}>
      <div className={getClassName('DrawerItem-Icon')}>
        <GripIcon size={20} />
      </div>
      <Column fullWidth alignItems='start' gap={0} justifyContent='start'>
        <span className={getClassName('DrawerItem-Name')}>{name}</span>
      </Column>
      {/* {component.thumbnail && (
          <ComponentThumbnail>
            <img src={component.thumbnail} alt={component.name} />
          </ComponentThumbnail>
        )} */}
    </Row>
  );
}
