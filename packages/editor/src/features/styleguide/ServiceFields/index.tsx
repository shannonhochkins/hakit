import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { ServiceField } from '@components/Form/Field/Service';

export function StyleguideServiceFields() {
  const [service, setService] = useState<string>('');
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Service Field - Basic'>
        <ServiceField id='service-basic' name='service' value={service} onChange={setService} />
      </Group>
      <Group title='Service Field - With Initial Value'>
        <ServiceField id='service-initial' name='serviceInitial' value={service || 'turn_on'} onChange={setService} />
      </Group>
    </Column>
  );
}
/// TODO - doesn't work because it needs puck, but this feels wrong....
