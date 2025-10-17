import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { ServiceField } from '@components/Form/Field/Service';
import { DomainService } from '@hakit/core';

export function StyleguideServiceFields() {
  const [service, setService] = useState<DomainService<'light'>>('turn_on');
  const [serviceInitial, setServiceInitial] = useState<DomainService<'calendar'>>('createEvent');
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Service Field - Basic'>
        <ServiceField id='service-basic' domain='light' name='service' value={service} onChange={setService} />
      </Group>
      <Group title='Service Field - With Initial Value'>
        <ServiceField id='service-initial' domain='calendar' name='serviceInitial' value={serviceInitial} onChange={setServiceInitial} />
      </Group>
    </Column>
  );
}
