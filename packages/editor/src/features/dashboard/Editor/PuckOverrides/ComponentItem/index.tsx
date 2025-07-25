import { PropsOf } from '@emotion/react';
import styled from '@emotion/styled';
import { Column, Row } from '@hakit/components';
import { Overrides } from '@measured/puck';
import { GripIcon } from 'lucide-react';

const ComponentItemWrapper = styled(Row)`
  gap: var(--space-3);
  padding: var(--space-2);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  cursor: move;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-border);
  }

  &:hover .grip-icon {
    color: var(--color-text-primary);
  }
`;

const GripIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
`;

const ComponentName = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
`;

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

export function ComponentItem({
  name,
  // children
}: PropsOf<Overrides['componentItem']>) {
  return (
    <ComponentItemWrapper key={name} draggable wrap='nowrap' fullWidth alignItems='center' justifyContent='start'>
      <GripIconWrapper className='grip-icon'>
        <GripIcon size={20} />
      </GripIconWrapper>
      <Column fullWidth alignItems='start' gap={0} justifyContent='start'>
        <ComponentName>{name}</ComponentName>
      </Column>
      {/* {component.thumbnail && (
          <ComponentThumbnail>
            <img src={component.thumbnail} alt={component.name} />
          </ComponentThumbnail>
        )} */}
    </ComponentItemWrapper>
  );
}
