import { useState } from 'react';
import { Column } from '@components/Layout';

import { EntityField } from '@components/Form/Field/Entity';
import { EntityName } from '@hakit/core';
import { Group } from '@components/Group';

export function StyleguideEntityFields() {
  const [selectedEntity, setSelectedEntity] = useState<EntityName | undefined>(undefined);
  const [selectedEntity2, setSelectedEntity2] = useState<EntityName | undefined>('light.fake');
  const [selectedEntity3, setSelectedEntity3] = useState<EntityName | undefined>(undefined);
  const [selectedEntity4, setSelectedEntity4] = useState<EntityName | undefined>(undefined);

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Entity Fields' justifyContent='start' alignItems='start'>
        <EntityField
          id='entity-field-1'
          name='entity-field-1'
          value={selectedEntity}
          filterOption={entity => entity.entity_id?.startsWith('light')}
          onChange={(entityId, entity) => {
            console.debug('Selected entity:', entityId, entity);
            setSelectedEntity(entityId);
          }}
        />
      </Group>
      <Group title='Entity Fields' gap='1rem' justifyContent='start' alignItems='start'>
        <Column
          justifyContent='start'
          alignItems='start'
          style={{
            width: '33.33%',
          }}
        >
          <EntityField
            id='entity-field-2'
            name='entity-field-2'
            value={selectedEntity2}
            onChange={(entityId, entity) => {
              console.debug('Selected entity:', entityId, entity);
              setSelectedEntity2(entityId);
            }}
          />
        </Column>
        <Column
          justifyContent='start'
          alignItems='start'
          style={{
            width: '20%',
          }}
        >
          <EntityField
            id='entity-field-3'
            name='entity-field-3'
            value={selectedEntity3}
            onChange={(entityId, entity) => {
              console.debug('Selected entity:', entityId, entity);
              setSelectedEntity3(entityId);
            }}
          />
        </Column>
        <Column
          justifyContent='start'
          alignItems='start'
          style={{
            width: '200px',
          }}
        >
          <EntityField
            id='entity-field-4'
            name='entity-field-4'
            value={selectedEntity4}
            onChange={(entityId, entity) => {
              console.debug('Selected entity:', entityId, entity);
              setSelectedEntity4(entityId);
            }}
          />
        </Column>
      </Group>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <p>
          Selected: <strong>{selectedEntity}</strong>
        </p>
      </div>
    </Column>
  );
}
