import styled from '@emotion/styled';
import { TextField, type TextFieldProps } from '@mui/material';

const StyledTextField = styled(TextField)`
  padding-top: 12px;
  label {
    color: var(--puck-color-grey-04);
    top: 10px;
    &.Mui-focused {
      color: var(--puck-color-azure-05);
    }
    &.Mui-disabled {
      color: var(--puck-color-grey-04);
    }
  }
  .MuiFormHelperText-root {
    &:not(.Mui-error) {
      color: var(--puck-color-grey-04);
    }
    &.Mui-disabled {
      color: var(--puck-color-grey-05);
    }
  }
  .MuiInputBase-root {
    color: var(--puck-color-grey-02);
    background: var(--puck-color-grey-12);    
    input[type="text"], input[type="number"] {
      padding: 8px 14px;
    }
    &.Mui-focused fieldset {
      border-color: var(--puck-color-azure-05);
    }
    &.Mui-disabled.MuiOutlinedInput-root  {
      input {
        color: var(--puck-color-grey-04);
        -webkit-text-fill-color: var(--puck-color-grey-04);
      }
      div:has(>svg) {
        color: var(--puck-color-grey-04);;
      }
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
        color: var(--puck-color-grey-04);
        -webkit-text-fill-color: var(--puck-color-grey-04);
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
