import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
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
  const [cssVar, setCssVar] = useState('var(--clr-primary-a60)');
  const [cssVarWithAlpha, setCssVarWithAlpha] = useState('color-mix(in srgb, var(--clr-primary-a40) 40%, transparent 60%)');

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Color Fields - With Label and Helper Text' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <ColorField
          label='Interactive Blue'
          helperText='Click to change'
          id='interactive-blue'
          value={basicColor}
          onChange={setBasicColor}
        />
        <pre>Value: {basicColor}</pre>
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

      <Group title='Css vars' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <div>
          <ColorField id='preselected-color' value={cssVar} onChange={setCssVar} />
        </div>

        <div>
          <ColorField id='css-var-with-alpha' value={cssVarWithAlpha} onChange={setCssVarWithAlpha} />
        </div>
      </Group>

      <Group title='No var picker' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <div>
          <ColorField id='no-var-color' value={basicColor} onChange={setBasicColor} disableThemeAutocomplete />
        </div>
      </Group>

      <Group title='Color Fields - Special Colors' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--clr-text-a10)' }}>
            Gradient: {gradientColor}
          </label>
          <ColorField id='gradient-color' value={gradientColor} onChange={setGradientColor} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--clr-text-a10)' }}>
            Transparent: {transparentColor}
          </label>
          <ColorField id='transparent-color' value={transparentColor} onChange={setTransparentColor} />
        </div>
      </Group>

      <Group title='Color Fields - Invalid Value' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <ColorField id='gradient-color' value={'okhlab(0, 0, 0, 0)'} onChange={setGradientColor} />
      </Group>
    </Column>
  );
}
