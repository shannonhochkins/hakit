import { useMemo } from 'react';
import { AutocompleteField, type SingleAutocompleteProps } from '../Autocomplete';
import styles from './IconField.module.css';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { Row } from '@components/Layout';

function IconRenderOption({ option }: { option: keyof typeof icons }) {
  const icon = icons[option];

  return (
    <div className={styles.optionRow}>
      <div className={styles.icon}>{createElement(icon, { size: 24 })}</div>
      <div className={styles.details}>
        <div className={styles.value}>{option}</div>
      </div>
    </div>
  );
}

export type IconFieldProps = Omit<SingleAutocompleteProps<keyof typeof icons>, 'options'> & {
  icon?: React.ReactNode;
  readOnly?: boolean;
  helperText?: string;
};

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

export function IconField({ value, onChange, id, name, readOnly, helperText, label, icon }: IconFieldProps) {
  const hasValue = useMemo(() => typeof value === 'string' && (String(value)?.trim() ?? '').length > 0, [value]);

  const matchedValue = useMemo(() => {
    return hasValue ? iconNames.find(option => option === value) : undefined;
  }, [value, hasValue]);

  return (
    <AutocompleteField
      id={id}
      name={name}
      icon={icon}
      readOnly={readOnly}
      multiple={false}
      listItemSize={48}
      error={!matchedValue && hasValue}
      helperText={!matchedValue && hasValue ? `Icon "${value}" not found` : helperText}
      label={label}
      placeholder={'Select an icon...'}
      options={iconNames}
      value={matchedValue}
      onChange={onChange}
      renderValue={option => (
        <Row alignItems='center' justifyContent='flex-start' gap='0.5rem'>
          {createElement(icons[option], { size: 24 })}
          <span>{option}</span>
        </Row>
      )}
      renderOption={option => <IconRenderOption option={option} />}
      isOptionEqualToValue={(option, selectedValue) => option === selectedValue}
    />
  );
}
