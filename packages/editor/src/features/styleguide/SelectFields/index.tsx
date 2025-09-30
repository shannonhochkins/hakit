import { useState } from 'react';
import { Group, Row } from '@hakit/components';
import { SelectField } from '@components/Form/Field/Select';

const simpleOptions = ['Apple', 'Banana', 'Cherry', 'Date'] as const;
const objectOptions = [
  { label: 'United States', value: 'us' },
  { label: 'Australia', value: 'au' },
  { label: 'Germany', value: 'de' },
] as const;

export function StyleguideSelectFields() {
  const [simple, setSimple] = useState<(typeof simpleOptions)[number]>('Apple');
  const [country, setCountry] = useState<(typeof objectOptions)[number]>(objectOptions[0]);
  const [multi, setMulti] = useState<(typeof simpleOptions)[number][]>([]);

  return (
    <Row
      fullWidth
      alignItems='start'
      justifyContent='start'
      style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-gray-900)' }}
    >
      <Group title='Select Fields - Controlled Examples' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <SelectField
          id='select-simple'
          helperText='Select a fruit'
          label='Simple Select'
          options={simpleOptions}
          value={simple}
          onChange={setSimple}
        />
        <SelectField
          id='select-object'
          label='Object Select'
          options={objectOptions}
          value={country}
          onChange={setCountry}
          renderOption={o => o.label}
          renderValue={v => v.label}
        />
        <SelectField
          id='select-multi'
          label='Multiple Select'
          options={simpleOptions}
          multiple
          value={multi}
          onChange={e => setMulti(e)}
          helperText='Pick many'
        />
      </Group>

      <Group title='Select Fields - Sizes'>
        <SelectField id='select-small' label='Small' options={simpleOptions} size='small' value={simple} onChange={setSimple} />
        <SelectField id='select-medium' label='Medium' options={simpleOptions} size='medium' value={simple} onChange={setSimple} />
        <SelectField id='select-large' label='Large' options={simpleOptions} size='large' value={simple} onChange={setSimple} />
      </Group>

      <Group title='Select Fields - States'>
        <SelectField id='select-disabled' label='Disabled' options={simpleOptions} disabled />
        <SelectField id='select-error' label='Error' options={simpleOptions} error helperText='This field has an error' />
        <SelectField id='select-success' label='Success' options={simpleOptions} success helperText='This field is valid' />
      </Group>
    </Row>
  );
}
