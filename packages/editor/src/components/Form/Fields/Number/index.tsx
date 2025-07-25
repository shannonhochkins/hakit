import styled from '@emotion/styled';
import { TextField, type TextFieldProps } from '@mui/material';

const StyledTextField = styled(TextField)`
  padding: 0;
  margin: 0;

  label {
    color: var(--color-text-primary);
    top: var(--space-2);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);

    &.Mui-focused {
      color: var(--color-primary-500);
    }
    &.Mui-disabled {
      color: var(--color-text-muted);
    }
  }

  .MuiInputAdornment-root {
    color: var(--color-text-muted);
  }

  .MuiFormHelperText-root {
    font-size: var(--font-size-xs);
    margin-top: var(--space-1);

    &:not(.Mui-error) {
      color: var(--color-text-muted);
    }
    &.Mui-disabled {
      color: var(--color-text-muted);
    }
  }

  .MuiInputBase-root {
    color: var(--color-text-primary);
    background: var(--color-surface);
    border-radius: var(--radius-md);

    input[type='number'] {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
    }

    fieldset {
      border-color: var(--color-border);
      transition: all var(--transition-normal);
    }

    &:hover:not(.Mui-disabled) fieldset {
      border-color: var(--color-border-hover);
    }

    &.Mui-focused fieldset {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &.Mui-error fieldset {
      border-color: var(--color-error-500);
    }

    &.Mui-error.Mui-focused fieldset {
      border-color: var(--color-error-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    &.Mui-disabled {
      background-color: var(--color-surface-muted);

      fieldset {
        border-color: var(--color-border-subtle);
      }

      input {
        color: var(--color-text-muted);
        -webkit-text-fill-color: var(--color-text-muted);
      }
    }
  }

  &.read-only {
    .MuiInputBase-root {
      background-color: var(--color-surface-muted);

      fieldset {
        border-color: transparent;
      }
      input {
        color: var(--color-text-muted);
        -webkit-text-fill-color: var(--color-text-muted);
      }
    }
  }

  &.hide-value {
    .MuiInputBase-input {
      opacity: 0;
    }
  }
`;

export interface NumberFieldProps extends Omit<TextFieldProps, 'type' | 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

export const NumberField = ({ className, value, onChange, min, max, step, readOnly, ...props }: NumberFieldProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    const inputValue = event.target.value;

    // If the input is empty, call onChange with undefined
    if (inputValue === '') {
      onChange?.(undefined);
      return;
    }

    // Parse the number value
    const numericValue = parseFloat(inputValue);

    // Check if it's a valid number
    if (!isNaN(numericValue)) {
      // Apply min/max constraints if provided
      let constrainedValue = numericValue;

      if (typeof min === 'number' && constrainedValue < min) {
        constrainedValue = min;
      }

      if (typeof max === 'number' && constrainedValue > max) {
        constrainedValue = max;
      }

      onChange?.(constrainedValue);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (readOnly) return;

    // On blur, ensure the value respects step if provided
    if (typeof step === 'number' && typeof value === 'number') {
      const steppedValue = Math.round(value / step) * step;
      if (steppedValue !== value) {
        onChange?.(steppedValue);
      }
    }

    // Call the original onBlur if provided
    props.onBlur?.(event);
  };

  return (
    <StyledTextField
      {...props}
      type='number'
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${className ?? ''} ${readOnly ? 'read-only' : ''}`}
      slotProps={{
        ...props.slotProps,
        input: {
          readOnly,
          inputProps: {
            min,
            max,
            step,
          },
          ...(props.slotProps?.input ?? {}),
        },
      }}
    />
  );
};
