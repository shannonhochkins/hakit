import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { CodeField } from '@components/Form/Field/Code';

export function StyleguideCodeFields() {
  const [value, setValue] = useState<object>({
    name: 'Example',
    enabled: true,
  });
  const [value2, setValue2] = useState<object>({
    name: 'Example',
    enabled: true,
  });
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Code Field - Preview Only'>
        <CodeField
          helperText='Click "Edit" to open the code editor...'
          value={value2}
          label='Code Field - Preview Only'
          language='json'
          onChange={setValue2}
          id='code-field-preview-only'
          name='code-field-preview-only'
        />
      </Group>
      <Group title='Code Field - With Value (Preview)'>
        <CodeField
          value={value}
          helperText='Click "Edit" to open the code editor...'
          label='Code Field - With Value (Preview)'
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
          label='Code Field - Different Languages (CSS)'
          helperText='Click "Edit" to open the code editor...'
          value={'body { color: red; }'}
          language='css'
          onChange={() => {}}
          id='code-field-different-languages-css'
          name='code-field-different-languages-css'
        />
        <CodeField
          value={{ a: 1 }}
          language='json'
          onChange={() => {}}
          id='code-field-different-languages-json'
          name='code-field-different-languages-json'
        />
      </Group>
    </Column>
  );
}
