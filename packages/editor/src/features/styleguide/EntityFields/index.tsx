import { useState } from 'react';
import { Column, Row } from '@hakit/components';
import { Entity } from '@components/Form/Field/Entity';
import { HassEntity } from 'home-assistant-js-websocket';
import { EntityName } from '@hakit/core';

export function StyleguideEntityFields() {
  const [selectedEntity, setSelectedEntity] = useState<HassEntity | null>(null);

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
          value={selectedEntity?.entity_id as EntityName}
          onChange={(entityId, entity) => {
            console.log('Selected entity:', entityId, entity);
            setSelectedEntity(entity);
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
            value={selectedEntity?.entity_id as EntityName}
            onChange={(entityId, entity) => {
              console.log('Selected entity:', entityId, entity);
              setSelectedEntity(entity);
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
            value={selectedEntity?.entity_id as EntityName}
            onChange={(entityId, entity) => {
              console.log('Selected entity:', entityId, entity);
              setSelectedEntity(entity);
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
            value={selectedEntity?.entity_id as EntityName}
            onChange={(entityId, entity) => {
              console.log('Selected entity:', entityId, entity);
              setSelectedEntity(entity);
            }}
          />
        </Column>
      </Row>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <p>
          Selected: <strong>{selectedEntity?.attributes?.friendly_name}</strong>
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
