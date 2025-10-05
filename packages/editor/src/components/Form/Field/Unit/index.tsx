import { SelectField } from '../Select';
import { InputField, InputNumberProps } from '../Input';
import styles from './UnitField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { Column, Row } from '@components/Layout';
import { IconButton } from '@components/Button';
import { Grid2X2 } from 'lucide-react';

const getClassName = getClassNameFactory('UnitField', styles);
export type Unit = 'auto' | 'px' | 'em' | 'rem' | 'vh' | 'vw' | '%';

export type UnitFieldValueSingle = {
  value: number;
  unit: Unit;
};

export type UnitFieldValueAllCorners = {
  top: UnitFieldValueSingle;
  left: UnitFieldValueSingle;
  right: UnitFieldValueSingle;
  bottom: UnitFieldValueSingle;
};

export type UnitFieldValue = UnitFieldValueSingle | UnitFieldValueAllCorners;

export type UnitFieldProps = Omit<InputNumberProps, 'endAdornment' | 'onChange' | 'value' | 'type'> &
  (
    | {
        supportsAllCorners: true;
        value: UnitFieldValue;
        onChange: (value: UnitFieldValue) => void;
      }
    | {
        supportsAllCorners?: false;
        value: UnitFieldValueSingle;
        onChange: (value: UnitFieldValueSingle) => void;
      }
  );

const DEFAULT_UNIT = 'px';

const unitOptions: { label: Unit; value: Unit }[] = [
  { label: 'auto', value: 'auto' },
  { label: 'px', value: 'px' },
  { label: 'em', value: 'em' },
  { label: 'rem', value: 'rem' },
  { label: 'vh', value: 'vh' },
  { label: 'vw', value: 'vw' },
  { label: '%', value: '%' },
];

export function UnitField({ onChange, value, className, label, supportsAllCorners = false, ...props }: UnitFieldProps) {
  // if there's no "value" in the value, we're dealing with all corners, but also make sure the value is defined
  if (value !== undefined && typeof value === 'object' && !('value' in value)) {
    // render the same field below for each corner
    return (
      <Column alignItems='start' justifyContent='start' gap='var(--space-4)'>
        {Object.entries(value).map(([corner, value], index) => {
          const matchedUnit = unitOptions.find(option => option.value === value.unit);
          return (
            <InputField
              key={corner}
              className={getClassName(undefined, className)}
              type='number'
              value={value.value}
              label={label + ' (' + corner + ')'}
              onChange={e => onChange({ ...value, [corner]: { value: e.target.valueAsNumber, unit: matchedUnit?.value || DEFAULT_UNIT } })}
              endAdornment={{
                variant: 'custom',
                content: (
                  <SelectField
                    id={`${props.id}-unit-field-dropdown`}
                    name={`${props.name}-unit-field-dropdown`}
                    options={unitOptions}
                    value={matchedUnit}
                    onChange={unit => onChange({ ...value, [corner]: { value: value.value, unit: unit.value } })}
                  />
                ),
              }}
              rowAdornment={
                index === 0 && (
                  <IconButton
                    icon={<Grid2X2 size={16} />}
                    aria-label='Individual corners'
                    // just prioritize one when swapping back
                    onClick={() => onChange({ value: value.value, unit: value.unit })}
                  />
                )
              }
              {...props}
            />
          );
        })}
      </Column>
    );
  }

  const matchedUnit = unitOptions.find(option => option.value === value.unit);

  return (
    <Row alignItems='start' justifyContent='start' gap='var(--space-2)' wrap='nowrap'>
      <InputField
        className={getClassName(undefined, className)}
        type='number'
        value={value.value}
        label={label}
        onChange={e => onChange({ value: e.target.valueAsNumber, unit: matchedUnit?.value || DEFAULT_UNIT })}
        endAdornment={{
          variant: 'custom',
          content: (
            <SelectField
              id={`${props.id}-unit-field-dropdown`}
              name={`${props.name}-unit-field-dropdown`}
              options={unitOptions}
              value={matchedUnit}
              onChange={unit => onChange({ value: value.value, unit: unit.value })}
            />
          ),
        }}
        rowAdornment={
          supportsAllCorners && (
            <IconButton
              icon={<Grid2X2 size={16} />}
              aria-label='All sides'
              onClick={() =>
                onChange({
                  top: { value: value.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                  left: { value: value.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                  right: { value: value.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                  bottom: { value: value.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                  // dodgey, but works
                } as unknown as UnitFieldValueSingle)
              }
            />
          )
        }
        {...props}
      />
    </Row>
  );
}
