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
import { Row } from '@hakit/components';
import { SelectField } from '@components/Form/Field/Select';
import { StyleguideButtons } from './Buttons';
import { StyleguideCodeFields } from './CodeFields';
import { StyleguideServiceFields } from './ServiceFields';
import { StyleguideLoaders } from './Loaders';

export function Styleguide() {
  const [preview, setPreview] = useState<string>('Input Fields');
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
          value={preview}
          onChange={setPreview}
          options={[
            'Input Fields',
            'Switch Fields',
            'Radio Fields',
            'Autocomplete Fields',
            'Select Fields',
            'Slider Fields',
            'Entity Fields',
            'Color Fields',
            'Image Fields',
            'Buttons',
            'Code Fields',
            'Service Fields',
            'Loaders',
          ]}
        />
      </Row>
      {preview === 'Input Fields' && <StyleguideInputFields />}
      {preview === 'Switch Fields' && <StyleguideSwitchFields />}
      {preview === 'Radio Fields' && <StyleguideRadioFields />}
      {preview === 'Autocomplete Fields' && <StyleguideAutocompleteFields />}
      {preview === 'Select Fields' && <StyleguideSelectFields />}
      {preview === 'Slider Fields' && <StyleguideSliderFields />}
      {preview === 'Entity Fields' && <StyleguideEntityFields />}
      {preview === 'Color Fields' && <StyleguideColorFields />}
      {preview === 'Image Fields' && <StyleguideImageFields />}
      {preview === 'Buttons' && <StyleguideButtons />}
      {preview === 'Code Fields' && <StyleguideCodeFields />}
      {preview === 'Service Fields' && <StyleguideServiceFields />}
      {preview === 'Loaders' && <StyleguideLoaders />}
    </>
  );
}
