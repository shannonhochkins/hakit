import { SelectField } from '../Select';
import { InputField, InputNumberProps } from '../Input';
import styles from './UnitField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { Column, Row } from '@components/Layout';
import { IconButton } from '@components/Button';
import { Grid2X2 } from 'lucide-react';
import { getComputedValue, updateCornerValue, createAllCornersValue, createSingleValue } from './computedValue';
const getClassName = getClassNameFactory('UnitField', styles);

export const units = ['auto', 'px', 'em', 'rem', 'vh', 'vw', '%'] as const;
export type Unit = (typeof units)[number];

export type UnitFieldValueSingle = `${number}${Unit}`;

export type UnitFieldValueAllCorners = `${number}${Unit} ${number}${Unit} ${number}${Unit} ${number}${Unit}`;

export type UnitFieldValue = UnitFieldValueSingle | UnitFieldValueAllCorners | 'auto';

export type UnitFieldProps = Omit<InputNumberProps, 'endAdornment' | 'onChange' | 'value' | 'type'> &
  (
    | {
        supportsAllCorners: true;
        value?: UnitFieldValue;
        onChange: (value: UnitFieldValue) => void;
      }
    | {
        supportsAllCorners?: false;
        value?: UnitFieldValueSingle;
        onChange: (value: UnitFieldValueSingle) => void;
      }
  );

const DEFAULT_UNIT: Unit = 'px';

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
  const computedValue = getComputedValue(value) ?? { value: 0, unit: DEFAULT_UNIT };
  const _onChange = onChange as (value: UnitFieldValue) => void;
  // if there's no "value" in the value, we're dealing with all corners, but also make sure the value is defined
  if (typeof computedValue === 'object' && !('value' in computedValue)) {
    // render the same field below for each corner
    return (
      <Column alignItems='start' justifyContent='start' gap='var(--space-4)'>
        {Object.entries(computedValue).map(([corner, value], index) => {
          const matchedUnit = unitOptions.find(option => option.value === value.unit);
          return (
            <InputField
              key={corner}
              className={getClassName(undefined, className)}
              type='number'
              value={value.value}
              label={label + ' (' + corner + ')'}
              onChange={e => {
                _onChange(
                  updateCornerValue(computedValue, {
                    [corner]: { value: e.target.valueAsNumber, unit: matchedUnit?.value || DEFAULT_UNIT },
                  })
                );
              }}
              endAdornment={{
                variant: 'custom',
                content: (
                  <SelectField
                    id={`${props.id}-unit-field-dropdown`}
                    name={`${props.name}-unit-field-dropdown`}
                    options={unitOptions}
                    value={matchedUnit}
                    onChange={unit => {
                      _onChange(
                        updateCornerValue(computedValue, {
                          [corner]: { value: value.value, unit: unit.value },
                        })
                      );
                    }}
                  />
                ),
              }}
              rowAdornment={
                index === 0 && (
                  <IconButton
                    icon={<Grid2X2 size={16} />}
                    aria-label='Individual corners'
                    // just prioritize one when swapping back
                    onClick={() => _onChange(createSingleValue(value.value, value.unit))}
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

  const matchedUnit = unitOptions.find(option => option.value === computedValue.unit);

  return (
    <Row alignItems='start' justifyContent='start' gap='var(--space-2)' wrap='nowrap'>
      <InputField
        className={getClassName(undefined, className)}
        type='number'
        value={computedValue.value}
        label={label}
        onChange={e => _onChange(createSingleValue(e.target.valueAsNumber, matchedUnit?.value || DEFAULT_UNIT))}
        endAdornment={{
          variant: 'custom',
          content: (
            <SelectField
              id={`${props.id}-unit-field-dropdown`}
              name={`${props.name}-unit-field-dropdown`}
              options={unitOptions}
              value={matchedUnit}
              onChange={unit => _onChange(createSingleValue(computedValue.value, unit.value))}
            />
          ),
        }}
        rowAdornment={
          supportsAllCorners && (
            <IconButton
              icon={<Grid2X2 size={16} />}
              aria-label='All sides'
              onClick={() => {
                _onChange(
                  createAllCornersValue(
                    { value: computedValue.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                    { value: computedValue.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                    { value: computedValue.value, unit: matchedUnit?.value || DEFAULT_UNIT },
                    { value: computedValue.value, unit: matchedUnit?.value || DEFAULT_UNIT }
                  )
                );
              }}
            />
          )
        }
        {...props}
      />
    </Row>
  );
}
