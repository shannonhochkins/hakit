import { useState } from 'react';
import { StyleguideInputFields } from './InputFields';
import { StyleguideSwitchFields } from './SwitchFields';
import { StyleguideRadioFields } from './RadioFields';
import { StyleguideAutocompleteFields } from './AutocompleteFields';
import { StyleguideSelectFields } from './SelectFields';
import { StyleguideSliderFields } from './SliderFields';
import { StyleguideEntityFields } from './EntityFields';
import { StyleguideColorFields } from './ColorFields';
import { StyleguideImageFields } from './ImageFields';
import { Row } from '@components/Layout';
import { SelectField } from '@components/Form/Field/Select';
import { StyleguideButtons } from './Buttons';
import { StyleguideCodeFields } from './CodeFields';
import { StyleguideServiceFields } from './ServiceFields';
import { StyleguideLoaders } from './Loaders';

const options = [
  {
    label: 'Input Fields',
    value: 'Input Fields',
  },
  {
    label: 'Switch Fields',
    value: 'Switch Fields',
  },
  {
    label: 'Radio Fields',
    value: 'Radio Fields',
  },
  {
    label: 'Autocomplete Fields',
    value: 'Autocomplete Fields',
  },
  {
    label: 'Select Fields',
    value: 'Select Fields',
  },
  {
    label: 'Slider Fields',
    value: 'Slider Fields',
  },
  {
    label: 'Entity Fields',
    value: 'Entity Fields',
  },
  {
    label: 'Color Fields',
    value: 'Color Fields',
  },
  {
    label: 'Image Fields',
    value: 'Image Fields',
  },
  {
    label: 'Buttons',
    value: 'Buttons',
  },
  {
    label: 'Code Fields',
    value: 'Code Fields',
  },
  {
    label: 'Service Fields',
    value: 'Service Fields',
  },
  {
    label: 'Loaders',
    value: 'Loaders',
  },
] as const;

export function Styleguide() {
  const [preview, setPreview] = useState<(typeof options)[number]>(options[0]);
  return (
    <>
      <h1>Styleguide</h1>
      <Row
        fullWidth
        alignItems='start'
        justifyContent='start'
        gap='var(--space-2)'
        style={{
          marginBottom: 'var(--space-4)',
        }}
      >
        <SelectField
          id='styleguide-selector'
          label='Choose Field Type'
          multiple={false}
          value={preview}
          onChange={setPreview}
          options={options}
        />
      </Row>
      {preview.value === 'Input Fields' && <StyleguideInputFields />}
      {preview.value === 'Switch Fields' && <StyleguideSwitchFields />}
      {preview.value === 'Radio Fields' && <StyleguideRadioFields />}
      {preview.value === 'Autocomplete Fields' && <StyleguideAutocompleteFields />}
      {preview.value === 'Select Fields' && <StyleguideSelectFields />}
      {preview.value === 'Slider Fields' && <StyleguideSliderFields />}
      {preview.value === 'Entity Fields' && <StyleguideEntityFields />}
      {preview.value === 'Color Fields' && <StyleguideColorFields />}
      {preview.value === 'Image Fields' && <StyleguideImageFields />}
      {preview.value === 'Buttons' && <StyleguideButtons />}
      {preview.value === 'Code Fields' && <StyleguideCodeFields />}
      {preview.value === 'Service Fields' && <StyleguideServiceFields />}
      {preview.value === 'Loaders' && <StyleguideLoaders />}
    </>
  );
}
