import { useState } from 'react';
import { Group } from '@components/Group';
import { Row } from '@components/Layout';
import { ServiceField } from '@components/Form/Field/Service';

export function StyleguideServiceFields() {
  const [service, setService] = useState<string>('');
  return (
    <Row fullWidth alignItems='start' justifyContent='start' style={{ padding: 'var(--space-4)' }}>
      <Group title='Service Field - Basic'>
        <ServiceField id='service-basic' name='service' value={service} onChange={setService} />
      </Group>
      <Group title='Service Field - With Initial Value'>
        <ServiceField id='service-initial' name='serviceInitial' value={service || 'turn_on'} onChange={setService} />
      </Group>
    </Row>
  );
}
