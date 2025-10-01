import { useState } from 'react';
import { Group, Row } from '@hakit/components';
import { RadioField } from '../../../components/Form/Field/Radio';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
];

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function StyleguideRadioFields() {
  // Controlled state examples
  const [priority, setPriority] = useState('medium');
  const [theme, setTheme] = useState('auto');
  const [sizePreference, setSizePreference] = useState('medium');

  return (
    <Row
      fullHeight
      fullWidth
      alignItems='start'
      justifyContent='start'
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-gray-900)',
      }}
    >
      <Group title='Radio Fields - Controlled Examples'>
        <RadioField
          id='controlled-priority'
          label='Priority Level'
          options={priorityOptions}
          value={priority}
          onChange={e => setPriority(String(e))}
          helperText='Select your priority level'
        />
        <RadioField
          id='controlled-theme'
          label='Theme Preference'
          options={themeOptions}
          value={theme}
          onChange={e => setTheme(String(e))}
          horizontal
          helperText='Choose your preferred theme'
        />
        <RadioField
          id='controlled-size-pref'
          label='Size Preference'
          options={sizeOptions}
          value={sizePreference}
          onChange={e => setSizePreference(String(e))}
          helperText='Select your preferred component size'
        />
      </Group>

      <Group title='Radio Fields - Sizes'>
        <RadioField id='small-radio-vertical' label='Small (Vertical)' options={priorityOptions} size='small' horizontal={false} readOnly />
        <RadioField id='small-radio-horizontal' label='Small (Horizontal)' options={themeOptions} size='small' readOnly />
        <RadioField id='medium-radio-vertical' label='Medium (Vertical)' options={sizeOptions} size='medium' horizontal={false} readOnly />
        <RadioField id='medium-radio-horizontal' label='Medium (Horizontal)' options={priorityOptions} size='medium' readOnly />
        <RadioField id='large-radio-vertical' label='Large (Vertical)' options={themeOptions} size='large' horizontal={false} readOnly />
        <RadioField id='large-radio-horizontal' label='Large (Horizontal)' options={sizeOptions} size='large' readOnly />
      </Group>

      <Group title='Radio Fields - Layout Options'>
        <RadioField
          id='vertical-radio'
          label='Vertical Layout'
          options={priorityOptions}
          horizontal={false}
          helperText='Vertical layout with column direction'
          readOnly
        />
        <RadioField
          id='horizontal-radio'
          label='Horizontal Layout (Default)'
          options={themeOptions}
          helperText='Horizontal layout with flex wrap (default)'
          readOnly
        />
      </Group>

      <Group title='Radio Fields - States'>
        <RadioField id='radio-unchecked' name='unchecked-group' label='Unchecked State' options={priorityOptions} readOnly />
        <RadioField id='radio-prechecked' name='prechecked-group' label='Pre-checked State' options={themeOptions} value='dark' />
        <RadioField id='radio-disabled' name='disabled-group' label='Disabled State' options={sizeOptions} disabled />
        <RadioField
          id='radio-disabled-checked'
          name='disabled-checked-group'
          label='Disabled Checked State'
          options={priorityOptions}
          value='high'
          disabled
        />
      </Group>

      <Group title='Radio Fields - With Helper Text'>
        <RadioField
          id='radio-with-helper'
          name='helper-group'
          label='Radio with Helper Text'
          options={themeOptions}
          helperText='This radio group has helper text'
          readOnly
        />
        <RadioField
          id='radio-horizontal-helper'
          name='horizontal-helper-group'
          label='Horizontal Radio with Helper'
          options={priorityOptions}
          horizontal
          helperText='Horizontal layout with helper text'
          readOnly
        />
      </Group>
    </Row>
  );
}
