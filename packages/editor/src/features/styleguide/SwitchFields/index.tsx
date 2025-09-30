import React, { useState } from 'react';
import { Group, Row } from '@hakit/components';
import { SwitchField } from '@components/Form/Field/Switch';

export function StyleguideSwitchFields() {
  // Controlled state examples
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
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
      <Group title='Switch Fields - Controlled Examples'>
        <SwitchField
          id='controlled-notifications'
          label='Enable Notifications'
          checked={notificationsEnabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationsEnabled(e.target.checked)}
        />
        <SwitchField
          id='controlled-dark-mode'
          label='Dark Mode'
          checked={darkModeEnabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDarkModeEnabled(e.target.checked)}
          helperText='Toggle dark mode theme'
        />
        <SwitchField
          id='controlled-advanced'
          label='Advanced Features'
          checked={advancedFeaturesEnabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdvancedFeaturesEnabled(e.target.checked)}
          helperText='Unlock advanced functionality'
        />
      </Group>

      <Group title='Switch Fields - Basic Examples'>
        <SwitchField id='basic-switch' label='Basic Switch' />
        <SwitchField id='checked-switch' label='Checked Switch' checked />
        <SwitchField id='disabled-switch' label='Disabled Switch' disabled />
        <SwitchField id='disabled-checked-switch' label='Disabled Checked Switch' disabled checked />
      </Group>

      <Group title='Switch Fields - Sizes'>
        <SwitchField id='small-switch' label='Small Switch' size='small' />
        <SwitchField id='medium-switch' label='Medium Switch' size='medium' />
        <SwitchField id='large-switch' label='Large Switch' size='large' />
      </Group>

      <Group title='Switch Fields - With Helper Text'>
        <SwitchField id='switch-with-helper' label='Switch with Helper Text' helperText='This is helper text for the switch' />
        <SwitchField id='switch-with-helper-checked' label='Checked Switch with Helper' helperText='This switch is enabled' checked />
      </Group>

      <Group title='Switch Fields - States'>
        <SwitchField id='unchecked-switch' label='Unchecked State' />
        <SwitchField id='checked-switch-state' label='Checked State' checked />
        <SwitchField id='disabled-unchecked' label='Disabled Unchecked' disabled />
        <SwitchField id='disabled-checked-state' label='Disabled Checked' disabled checked />
      </Group>
    </Row>
  );
}
