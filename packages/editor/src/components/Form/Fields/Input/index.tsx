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

    input[type='text'],
    input[type='number'] {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
    }

    .MuiInputAdornment-sizeMedium {
      + input[type='text'],
      + input[type='number'] {
        padding: var(--space-3) var(--space-4);
        font-size: var(--font-size-md);
      }
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
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .MuiInputBase-input {
      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px var(--color-surface) inset !important;
        -webkit-text-fill-color: var(--color-text-primary) !important;
        caret-color: var(--color-text-primary) !important;
        background-color: var(--color-surface) !important;
        color: var(--color-text-primary) !important;
        transition: background-color 5000s ease-in-out 0s;
      }
      &:-internal-autofill-selected {
        appearance: none !important;
        background-color: var(--color-surface) !important;
        background-image: none !important;
        color: var(--color-text-primary) !important;
        -webkit-text-fill-color: var(--color-text-primary) !important;
      }
    }

    &.Mui-disabled.MuiOutlinedInput-root {
      background: var(--color-surface-muted);

      input {
        color: var(--color-text-muted);
        -webkit-text-fill-color: transparent;
      }

      div:has(> svg) {
        color: var(--color-text-muted);
      }

      fieldset {
        border-color: var(--color-border-subtle);
      }
    }
  }

  &.MuiFormControl-root.MuiTextField-root label {
    top: var(--space-1);

    &.Mui-focused {
      top: var(--space-2);
    }
    &.MuiInputLabel-shrink {
      top: var(--space-2);
    }
  }

  &.read-only {
    label {
      display: none;
    }
    .MuiFormHelperText-root {
      display: none;
    }
    .MuiInputBase-root {
      background: transparent;
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

export const InputField = ({
  className,
  size = 'small',
  ...props
}: TextFieldProps & {
  readOnly?: boolean;
}) => {
  return (
    <StyledTextField
      size={size}
      className={`${className ?? ''} ${props.readOnly ? 'read-only' : ''}`}
      slotProps={{
        ...props.slotProps,
        input: {
          readOnly: props.readOnly,
          ...(props.slotProps?.input ?? {}),
        },
      }}
      {...props}
    />
  );
};
