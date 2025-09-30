import { useState } from 'react';
import { Column, Group } from '@hakit/components';
import { ColorField } from '@components/Form/Field/Color';

export function StyleguideColorFields() {
  // State for different color examples
  const [basicColor, setBasicColor] = useState('#3b82f6');
  const [redColor, setRedColor] = useState('#ef4444');
  const [greenColor, setGreenColor] = useState('#22c55e');
  const [purpleColor, setPurpleColor] = useState('#a855f7');
  const [gradientColor, setGradientColor] = useState(
    'linear-gradient(90deg, RGB(31, 22, 195) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)'
  );
  const [transparentColor, setTransparentColor] = useState('rgba(0, 0, 0, 0)');

  return (
    <Column
      fullHeight
      fullWidth
      alignItems='start'
      justifyContent='start'
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-gray-900)',
      }}
    >
      <Group title='Color Fields - With Label and Helper Text' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <ColorField
          label='Interactive Blue'
          helperText='Click to change'
          id='interactive-blue'
          value={basicColor}
          onChange={setBasicColor}
        />
      </Group>
      <Group title='Color Fields - Basic Colors' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <div
          style={{
            width: '200px',
          }}
        >
          <ColorField id='basic-color' value={basicColor} onChange={setBasicColor} />
        </div>

        <div
          style={{
            width: '300px',
          }}
        >
          <ColorField id='red-color' value={redColor} onChange={setRedColor} />
        </div>

        <div
          style={{
            width: '150px',
          }}
        >
          <ColorField id='green-color' value={greenColor} onChange={setGreenColor} />
        </div>

        <div
          style={{
            width: '100%',
          }}
        >
          <ColorField id='purple-color' value={purpleColor} onChange={setPurpleColor} />
        </div>
      </Group>

      <Group title='Color Fields - Special Colors' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Gradient: {gradientColor}
          </label>
          <ColorField id='gradient-color' value={gradientColor} onChange={setGradientColor} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Transparent: {transparentColor}
          </label>
          <ColorField id='transparent-color' value={transparentColor} onChange={setTransparentColor} />
        </div>
      </Group>
    </Column>
  );
}
