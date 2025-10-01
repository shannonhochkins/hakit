import { useState } from 'react';
import { Row, Column } from '@components/Layout';

import { Entity } from '@components/Form/Field/Entity';
import { EntityName } from '@hakit/core';

export function StyleguideEntityFields() {
  const [selectedEntity, setSelectedEntity] = useState<EntityName | undefined>(undefined);
  const [selectedEntity2, setSelectedEntity2] = useState<EntityName | undefined>('light.fake');
  const [selectedEntity3, setSelectedEntity3] = useState<EntityName | undefined>(undefined);
  const [selectedEntity4, setSelectedEntity4] = useState<EntityName | undefined>(undefined);

  return (
    <Column
      fullHeight
      fullWidth
      alignItems='flex-start'
      justifyContent='flex-start'
      gap='2rem'
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-gray-900)',
      }}
    >
      <Row title='Entity Fields' fullWidth justifyContent='start' alignItems='start'>
        <Entity
          id='entity-field-1'
          name='entity-field-1'
          value={selectedEntity}
          filterOptions={entities => entities.filter(entity => entity.entity_id?.startsWith('light'))}
          onChange={(entityId, entity) => {
            console.log('Selected entity:', entityId, entity);
            setSelectedEntity(entityId);
          }}
        />
      </Row>
      <Row gap='1rem' fullWidth justifyContent='start' alignItems='start'>
        <Column
          justifyContent='start'
          alignItems='start'
          style={{
            width: '33.33%',
          }}
        >
          <Entity
            id='entity-field-2'
            name='entity-field-2'
            value={selectedEntity2}
            onChange={(entityId, entity) => {
              console.log('Selected entity:', entityId, entity);
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
          <Entity
            id='entity-field-3'
            name='entity-field-3'
            value={selectedEntity3}
            onChange={(entityId, entity) => {
              console.log('Selected entity:', entityId, entity);
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
          <Entity
            id='entity-field-4'
            name='entity-field-4'
            value={selectedEntity4}
            onChange={(entityId, entity) => {
              console.log('Selected entity:', entityId, entity);
              setSelectedEntity4(entityId);
            }}
          />
        </Column>
      </Row>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <p>
          Selected: <strong>{selectedEntity}</strong>
        </p>
      </div>

      {/* <Group title='Entity Fields - With Different States'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Entity value='light.living_room' onChange={entityId => console.log('Light changed to:', entityId)} />
          <Entity value='sensor.time' onChange={entityId => console.log('Sensor changed to:', entityId)} />
          <Entity value='binary_sensor.door_front' onChange={entityId => console.log('Binary sensor changed to:', entityId)} />
        </div>
      </Group> */}
    </Column>
  );
}
