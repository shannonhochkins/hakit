import { RepositoryVersionAPI } from '@typings/db';
import styled from '@emotion/styled';
import { Row } from '@hakit/components';

const ComponentTag = styled.span`
  background: var(--color-primary-900);
  color: var(--color-primary-300);
  font-size: var(--font-size-xs);
  padding: calc(var(--space-1) / 2) var(--space-1);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
`;

export function ComponentTags({ components }: { components: RepositoryVersionAPI['components'] }) {
  return (
    components &&
    components.length > 0 && (
      <Row fullWidth alignItems='flex-start' justifyContent='flex-start' gap='var(--space-2)'>
        {components.slice(0, 3).map(component => (
          <ComponentTag key={component.name}>{component.name}</ComponentTag>
        ))}
        {components.length > 3 && <ComponentTag>+{components.length - 3} more</ComponentTag>}
      </Row>
    )
  );
}
