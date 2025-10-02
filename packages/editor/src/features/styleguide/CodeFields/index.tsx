import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { CodeField } from '@components/Form/Field/Code';

export function StyleguideCodeFields() {
  const [value, setValue] = useState<string>(`{
  "name": "Example",
  "enabled": true
}`);
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Code Field - Preview Only'>
        <CodeField value='' language='json' onChange={() => {}} id='code-field-preview-only' name='code-field-preview-only' />
      </Group>
      <Group title='Code Field - With Value (Preview)'>
        <CodeField
          value={value}
          language='json'
          onChange={setValue}
          id='code-field-with-value-preview'
          name='code-field-with-value-preview'
        />
      </Group>
      <Group title='Code Field - Edit Mode'>
        {/* Simulate edit by providing a controlled toggle: consumers will click Edit button to load monaco */}
        <CodeField value={value} language='json' onChange={setValue} id='code-field-edit-mode' name='code-field-edit-mode' />
      </Group>
      <Group title='Code Field - Different Languages'>
        <CodeField
          value={'body { color: red; }'}
          language='css'
          onChange={() => {}}
          id='code-field-different-languages-css'
          name='code-field-different-languages-css'
        />
        <CodeField
          value={'{"a":1}'}
          language='json'
          onChange={() => {}}
          id='code-field-different-languages-json'
          name='code-field-different-languages-json'
        />
      </Group>
    </Column>
  );
}
