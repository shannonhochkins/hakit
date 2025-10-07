import { RepositoryVersion } from '@typings/hono';
import { Row } from '@components/Layout';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './ComponentTags.module.css';

const getClassName = getClassNameFactory('ComponentTags', styles);
export function ComponentTags({ components }: { components: RepositoryVersion['components'] }) {
  return (
    components &&
    components.length > 0 && (
      <Row fullWidth alignItems='flex-start' justifyContent='flex-start' gap='var(--space-2)'>
        {components.slice(0, 3).map(component => (
          <span key={component.name} className={getClassName()}>
            {component.name}
          </span>
        ))}
        {components.length > 3 && <span className={getClassName()}>+{components.length - 3} more</span>}
      </Row>
    )
  );
}
