import styled from '@emotion/styled';
import { TextField, type TextFieldProps } from '@mui/material';

const StyledTextField = styled(TextField)`
  padding-top: var(--space-1);
  padding-bottom: var(--space-4);
  
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
    
    input[type="text"], input[type="number"] {
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
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    &.Mui-disabled.MuiOutlinedInput-root {
      background: var(--color-surface-muted);
      
      input {
        color: var(--color-text-muted);
        -webkit-text-fill-color: var(--color-text-muted);
      }
      
      div:has(>svg) {
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
  ...props
}: TextFieldProps & {
  readOnly?: boolean
}) => {
  return (
    <StyledTextField
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
