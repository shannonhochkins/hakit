import { createElement, useState } from 'react';
import { Column } from '@components/Layout';
import { Group } from '@components/Group';
import { icons } from 'lucide-react';
import { IconField } from '@components/Form/Field/Icon';
import { renderToString } from 'react-dom/server';

export function StyleguideIconFields() {
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof icons | undefined>(undefined);
  const IconComponent = selectedIcon ? icons[selectedIcon] : undefined;
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Icon Fields' justifyContent='start' alignItems='start'>
        <IconField
          id='icon-field-1'
          name='icon-field-1'
          value={selectedIcon}
          onChange={icon => {
            console.debug('Selected icon:', icon);
            setSelectedIcon(icon);
          }}
        />
        <div style={{ marginTop: 'var(--space-4)', width: '100%' }}>
          <p>
            Selected: <strong>{selectedIcon ? createElement(icons[selectedIcon], { size: 24 }) : 'None'}</strong>
          </p>
          <p>
            Themed icon:
            <strong>{IconComponent ? <IconComponent size={40} color='red' /> : 'None'}</strong>
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', wordBreak: 'break-all' }}>
            {selectedIcon ? renderToString(createElement(icons[selectedIcon], { size: 24 })) : 'None'}
          </pre>
        </div>
      </Group>
    </Column>
  );
}
