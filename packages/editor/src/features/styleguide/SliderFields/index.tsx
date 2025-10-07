import { useState } from 'react';
import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { SliderField } from '@components/Form/Field/Slider';

export function StyleguideSliderFields() {
  // Controlled state examples
  const [basicValue, setBasicValue] = useState(50);
  const [steppedValue, setSteppedValue] = useState(5);
  const [smallValue, setSmallValue] = useState(25);
  const [mediumValue, setMediumValue] = useState(50);
  const [largeValue, setLargeValue] = useState(75);

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Slider Fields - Controlled Examples' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <SliderField
          id='controlled-basic'
          helperText='Basic Controlled Slider'
          label={`Basic Controlled Slider: ${basicValue}`}
          value={basicValue}
          onChange={setBasicValue}
          min={0}
          max={100}
          name='controlled-basic'
        />
        <SliderField
          id='controlled-stepped'
          label={`Stepped Slider: ${steppedValue}`}
          value={steppedValue}
          onChange={setSteppedValue}
          min={0}
          max={10}
          step={1}
          name='controlled-stepped'
        />
      </Group>

      <Group title='Slider Fields - Sizes'>
        <SliderField
          id='slider-small'
          label='Small Slider'
          size='small'
          value={30}
          onChange={() => {}}
          min={0}
          max={100}
          name='slider-small'
        />
        <SliderField
          id='slider-medium'
          label='Medium Slider (Default)'
          size='medium'
          value={50}
          onChange={() => {}}
          min={0}
          max={100}
          name='slider-medium'
        />
        <SliderField
          id='slider-large'
          label='Large Slider'
          size='large'
          value={70}
          onChange={() => {}}
          min={0}
          max={100}
          name='slider-large'
        />
      </Group>

      <Group title='Slider Fields - States'>
        <SliderField
          id='slider-error'
          label='Error Slider'
          error
          helperText='This slider has an error'
          value={smallValue}
          onChange={setSmallValue}
          min={0}
          max={100}
          name='slider-error'
        />
        <SliderField
          id='slider-success'
          label='Success Slider'
          success
          helperText='This slider is valid'
          value={mediumValue}
          onChange={setMediumValue}
          min={0}
          max={100}
          name='slider-success'
        />
        <SliderField id='slider-disabled' label='Disabled Slider' disabled value={40} min={0} max={100} name='slider-disabled' />
        <SliderField id='slider-readonly' label='Read-only Slider' readOnly value={60} min={0} max={100} name='slider-readonly' />
      </Group>

      <Group title='Slider Fields - Custom Examples'>
        <SliderField
          id='temperature-slider'
          label='Temperature Control'
          value={mediumValue}
          onChange={setMediumValue}
          min={0}
          max={50}
          step={0.5}
          valuePrefix=''
          valueSuffix='°C'
          showValue
          name='temperature-slider'
        />
        <SliderField
          id='price-slider'
          label='Price Range'
          value={largeValue}
          onChange={setLargeValue}
          min={0}
          max={500}
          step={5}
          valuePrefix='$'
          valueSuffix=''
          showValue
          name='price-slider'
        />
        <SliderField
          id='percentage-slider'
          label='Completion Percentage'
          value={mediumValue}
          onChange={setMediumValue}
          min={0}
          max={100}
          step={1}
          valuePrefix=''
          valueSuffix='%'
          showValue
          name='percentage-slider'
        />
      </Group>

      <Group title='Slider Fields - Stepped Sliders'>
        <SliderField
          id='stepped-small'
          label='Small Stepped Slider'
          size='small'
          value={2}
          onChange={() => {}}
          min={0}
          max={5}
          step={1}
          name='stepped-small'
        />
        <SliderField
          id='stepped-medium'
          label='Medium Stepped Slider (Default)'
          size='medium'
          value={mediumValue}
          onChange={setMediumValue}
          min={0}
          max={100}
          step={10}
          name='stepped-medium'
        />
        <SliderField
          id='stepped-large'
          label='Large Stepped Slider'
          size='large'
          value={largeValue}
          onChange={setLargeValue}
          min={0}
          max={100}
          step={5}
          name='stepped-large'
        />
      </Group>

      <Group title='Slider Fields - With Value Display'>
        <SliderField
          id='value-display-small'
          label='Small with Value'
          size='small'
          showValue
          value={smallValue}
          onChange={setSmallValue}
          min={0}
          max={100}
          valuePrefix=''
          valueSuffix='%'
          name='value-display-small'
        />
        <SliderField
          id='value-display-medium'
          label='Medium with Value (Default)'
          size='medium'
          showValue
          value={mediumValue}
          onChange={setMediumValue}
          min={0}
          max={100}
          valuePrefix=''
          valueSuffix='dB'
          name='value-display-medium'
        />
        <SliderField
          id='value-display-large'
          label='Large with Value'
          size='large'
          showValue
          value={largeValue}
          onChange={setLargeValue}
          min={0}
          max={50}
          valuePrefix=''
          valueSuffix='°C'
          name='value-display-large'
        />
      </Group>
    </Column>
  );
}
