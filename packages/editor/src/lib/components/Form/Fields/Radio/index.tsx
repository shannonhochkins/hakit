import styled from '@emotion/styled';
import { Radio, RadioGroup, FormControl, FormControlLabel, FormHelperText } from '@mui/material';

const StyledFormControl = styled(FormControl)`
  width: 100%;
  border: 1px solid var(--color-gray-800);
  border-radius: var(--radius-md);
  padding: var(--space-1);
`;

const StyledRadioGroup = styled(RadioGroup)`
  gap: var(--space-1);

  &.MuiRadioGroup-row {
    gap: var(--space-3);
    flex-wrap: wrap;
  }
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin: 0;

  .MuiFormControlLabel-label {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);

    &.Mui-disabled {
      color: var(--color-text-muted);
    }
  }
  .MuiFormGroup-root {
  }
`;

const StyledRadio = styled(Radio)`
  color: var(--color-border);
  padding: var(--space-2);

  &:hover {
    background-color: var(--color-surface-hover);
  }

  &.Mui-checked {
    color: var(--color-primary-500);
  }

  &.Mui-disabled {
    color: var(--color-border-subtle);
  }

  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }
`;

const StyledFormHelperText = styled(FormHelperText)`
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
  margin-left: 0;

  &:not(.Mui-error) {
    color: var(--color-text-muted);
  }

  &.Mui-disabled {
    color: var(--color-text-muted);
  }
`;

export interface RadioOption {
  label: string;
  value: string | number | boolean;
}

export interface RadioFieldProps {
  value?: string | number | boolean;
  options: RadioOption[];
  onChange?: (value: string | number | boolean) => void;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  /** Layout orientation of the radio options */
  orientation?: 'vertical' | 'horizontal';
}

export const RadioField = ({
  value,
  options,
  onChange,
  helperText,
  error,
  disabled,
  readOnly,
  name,
  id,
  orientation = 'vertical',
}: RadioFieldProps) => {
  // Determine if layout should be horizontal (backward compatibility with row prop)
  const isHorizontal = orientation === 'horizontal';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return;

    const selectedValue = event.target.value;
    // Find the original option to get the correct typed value
    const selectedOption = options.find(option => String(option.value) === selectedValue);
    if (selectedOption && onChange) {
      onChange(selectedOption.value);
    }
  };

  return (
    <StyledFormControl error={error} disabled={disabled}>
      <StyledRadioGroup name={name} id={id} value={String(value ?? '')} onChange={handleChange} row={isHorizontal}>
        {options.map((option, index) => (
          <StyledFormControlLabel
            key={index}
            value={String(option.value)}
            control={
              <StyledRadio
                disabled={disabled || readOnly}
                slotProps={{
                  input: { 'aria-label': option.label },
                }}
              />
            }
            label={option.label}
            disabled={disabled || readOnly}
          />
        ))}
      </StyledRadioGroup>
      {helperText && (
        <StyledFormHelperText error={error} disabled={disabled}>
          {helperText}
        </StyledFormHelperText>
      )}
    </StyledFormControl>
  );
};
