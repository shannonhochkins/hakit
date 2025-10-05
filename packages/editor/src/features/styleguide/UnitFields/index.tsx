import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { UnitField, UnitFieldValue, UnitFieldValueSingle } from '@components/Form/Field/Unit';

export function StyleguideUnitFields() {
  // Controlled state examples
  const [fontSizeValue, setFontSizeValue] = useState<UnitFieldValueSingle>('16px');
  const [spacingValue, setSpacingValue] = useState<UnitFieldValue>('1.5rem');
  const [widthValue, setWidthValue] = useState<UnitFieldValueSingle>('100%');
  const [heightValue, setHeightValue] = useState<UnitFieldValueSingle>('50vh');
  const [paddingValue, setPaddingValue] = useState<UnitFieldValue>('10rem 1rem 12rem 1rem');

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Unit Fields - Basic Examples' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <UnitField
          id='font-size-unit'
          label='Font Size'
          value={fontSizeValue}
          onChange={setFontSizeValue}
          placeholder='Enter font size'
          helperText='Set the font size with your preferred unit'
        />

        <UnitField
          id='padding-unit'
          label='Padding'
          value={paddingValue}
          onChange={setPaddingValue}
          supportsAllCorners
          placeholder='Enter padding'
          helperText='Set the padding with your preferred unit'
        />

        <UnitField
          id='spacing-unit'
          label='Spacing'
          value={spacingValue}
          onChange={setSpacingValue}
          supportsAllCorners
          placeholder='Enter spacing value'
          helperText='Set spacing using rem units for better scalability'
        />

        <UnitField
          id='width-unit'
          label='Width'
          value={widthValue}
          onChange={setWidthValue}
          placeholder='Enter width'
          helperText='Set width as percentage for responsive design'
        />
      </Group>

      <Group title='Unit Fields - Viewport Units' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <UnitField
          id='height-vh-unit'
          label='Height (Viewport)'
          value={heightValue}
          onChange={setHeightValue}
          placeholder='Enter height'
          helperText='Use viewport height units for full-screen layouts'
        />
      </Group>
    </Column>
  );
}
