import { useState } from 'react';
import { Group } from '@components/Group';
import { Row } from '@components/Layout';
import { AutocompleteField } from '@components/Form/Field/Autocomplete';
import { SearchIcon, UserIcon, MapPinIcon } from 'lucide-react';

const simpleOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'] as const;

const objectFruitOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
];

const countryOptions = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'India',
  'Brazil',
] as const;

const largeOptions = Array.from({ length: 1000 }, (_, i) => `Option ${i + 1}`);

export function StyleguideAutocompleteFields() {
  const [simpleValue, setSimpleValue] = useState<(typeof simpleOptions)[number]>('Apple');
  const [objectValue, setObjectValue] = useState<(typeof objectFruitOptions)[number]>(objectFruitOptions[0]);
  const [countryValue, setCountryValue] = useState<(typeof countryOptions)[number]>('Australia');
  const [multipleValues, setMultipleValues] = useState<string[]>([]);
  const [largeValue, setLargeValue] = useState('');

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
      <Group
        title='Autocomplete Fields - Controlled Examples'
        alignItems='start'
        justifyContent='start'
        gap='var(--space-4)'
        layout='column'
      >
        <AutocompleteField
          id='controlled-simple'
          label='Simple Autocomplete'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
          helperText='Type to search fruits'
        />
        <AutocompleteField
          id='controlled-simple'
          label='Object Autocomplete'
          options={objectFruitOptions}
          value={objectValue}
          onChange={setObjectValue}
          renderValue={val => val.label}
          renderOption={val => val.label}
          helperText='Type to search fruits'
        />
        <p>Testing object value: {objectValue.label}</p>
        <AutocompleteField
          id='controlled-country'
          label='Country Selection'
          options={countryOptions}
          value={countryValue}
          onChange={e => setCountryValue(e)}
          startAdornment={<MapPinIcon size={16} />}
          helperText='Select your country'
        />
        <AutocompleteField
          id='controlled-multiple'
          label='Multiple Selection'
          options={simpleOptions}
          value={multipleValues}
          onChange={vals => setMultipleValues([...vals])}
          multiple
          helperText='Select multiple fruits'
        />
        <p>Testing multiple values: {multipleValues.join(', ')}</p>
        <AutocompleteField
          id='controlled-large'
          label='Large Dataset (Virtualized)'
          options={largeOptions}
          value={largeValue}
          onChange={setLargeValue}
          helperText='1000 options with react-window virtualization'
        />

        <AutocompleteField id='no-data' label='No Data' options={[]} value={undefined} helperText='No data' />
      </Group>

      <Group title='Autocomplete Fields - Sizes' alignItems='start' justifyContent='start' gap='var(--space-4)' layout='column'>
        <AutocompleteField
          id='small-autocomplete'
          label='Small Size'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
          size='small'
        />
        <AutocompleteField
          id='medium-autocomplete'
          label='Medium Size (Default)'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
          size='medium'
        />
        <AutocompleteField
          id='large-autocomplete'
          label='Large Size'
          size='large'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
        />
      </Group>

      <Group title='Autocomplete Fields - With Adornments' alignItems='start' justifyContent='start' gap='var(--space-4)' layout='column'>
        <AutocompleteField
          id='search-adornment'
          label='Search with Icon'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
          startAdornment={<SearchIcon size={16} />}
          placeholder='Search fruits...'
        />
        <AutocompleteField
          id='user-adornment'
          label='User Selection'
          options={countryOptions}
          value={countryValue}
          onChange={setCountryValue}
          startAdornment={<UserIcon size={16} />}
          endAdornment={{ content: 'Select', variant: 'custom' }}
        />
        <AutocompleteField
          id='custom-adornment'
          label='Custom Adornments'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
          startAdornment={{ content: '🔍', variant: 'custom' }}
          endAdornment={{ content: '▼', variant: 'custom' }}
        />
      </Group>

      <Group title='Autocomplete Fields - States' alignItems='start' justifyContent='start' gap='var(--space-4)' layout='column'>
        <AutocompleteField
          id='autocomplete-unselected'
          label='Unselected State'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
        />
        <AutocompleteField
          id='autocomplete-selected'
          label='Pre-selected State'
          options={countryOptions}
          value={countryValue}
          onChange={setCountryValue}
        />
        <AutocompleteField
          id='autocomplete-disabled'
          label='Disabled State'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
          disabled
        />
        <AutocompleteField
          id='autocomplete-error'
          label='Error State'
          options={simpleOptions}
          error
          helperText='This field has an error'
          readOnly
        />
        <AutocompleteField
          id='autocomplete-success'
          label='Success State'
          options={countryOptions}
          success
          helperText='This field is valid'
          readOnly
        />
      </Group>

      <Group
        title='Autocomplete Fields - Multiple Selection'
        alignItems='start'
        justifyContent='start'
        gap='var(--space-4)'
        layout='column'
      >
        <AutocompleteField
          id='multiple-basic'
          label='Multiple Selection Basic'
          options={simpleOptions}
          value={multipleValues}
          onChange={vals => setMultipleValues([...vals])}
          multiple
        />
        <AutocompleteField
          id='multiple-preselected'
          label='Multiple Pre-selected'
          options={countryOptions}
          value={['United States', 'Canada', 'United Kingdom']}
          multiple
          readOnly
        />
        <AutocompleteField id='multiple-disabled' label='Multiple Disabled' options={simpleOptions} multiple disabled readOnly />
      </Group>

      <Group title='Autocomplete Fields - Performance' alignItems='start' justifyContent='start' gap='var(--space-4)' layout='column'>
        <AutocompleteField
          id='performance-small'
          label='Small Dataset'
          options={simpleOptions}
          value={simpleValue}
          onChange={setSimpleValue}
        />
        <AutocompleteField
          id='performance-medium'
          label='Medium Dataset'
          options={countryOptions}
          value={countryValue}
          onChange={setCountryValue}
        />
        <AutocompleteField
          id='performance-large'
          label='Large Dataset (Virtualized)'
          options={largeOptions}
          value={largeValue}
          onChange={setLargeValue}
        />
      </Group>
    </Row>
  );
}
