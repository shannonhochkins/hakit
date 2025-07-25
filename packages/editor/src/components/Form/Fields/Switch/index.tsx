import styled from '@emotion/styled';
import { Switch, FormControlLabel, FormControlLabelProps, FormHelperText, FormGroup } from '@mui/material';

const StyledFormControlLabel = styled(FormControlLabel)`
  padding: 0;
  margin: 0;
  .MuiFormControlLabel-label.Mui-disabled {
    color: var(--color-text-disabled);
  }
`;

const StyledFormGroup = styled(FormGroup)`
  .MuiFormHelperText-root:not(.Mui-error) {
    color: var(--color-text-muted);
    &.Mui-disabled {
      color: var(--color-text-disabled);
    }
  }
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const SwitchContainer = styled.div<{ loading?: boolean }>`
  position: relative;
  display: inline-flex;
  opacity: ${props => props.loading ? 0.7 : 1};
  pointer-events: ${props => props.loading ? 'none' : 'auto'};
`;

const StyledSwitchField = styled(Switch)<{ loading?: boolean }>`
  // Base styles
  .MuiSwitch-switchBase {
    transition: var(--transition-normal);
  }
  
  // Unchecked state
  .MuiSwitch-thumb {
    background-color: white;
    box-shadow: var(--shadow-sm);
  }
  .MuiSwitch-switchBase + .MuiSwitch-track {
    background-color: var(--color-gray-500);
    transition: background-color var(--transition-normal);
  }
  .MuiSwitch-switchBase.Mui-disabled {
    color: var(--color-text-disabled);
  }
  .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track {
    background-color: var(--color-border-subtle);
  }
  
  // Checked states - using gradient for enabled state
  .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb {
    background-color: white;
    box-shadow: var(--shadow-sm);
  }
  .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {
    background: var(--gradient-primary);
    transition: background var(--transition-normal);
  }  
  .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track {
    background-color: var(--color-border-subtle);
    opacity: 0.5;
  }
  .MuiSwitch-switchBase.Mui-checked.Mui-disabled {
    color: var(--color-text-disabled);
  }

  // Hover states
  .MuiSwitch-switchBase:not(.Mui-disabled):hover + .MuiSwitch-track {
    background-color: var(--color-gray-600);
  }
  .MuiSwitch-switchBase.Mui-checked:not(.Mui-disabled):hover + .MuiSwitch-track {
    background: var(--gradient-primary-hover);
  }

  // Loading state adjustments
  ${props => props.loading && `
    .MuiSwitch-thumb {
      opacity: 0.8;
    }
  `}
`;

export const SwitchField = ({
  helperText,
  error,
  style,
  label = '',
  loading = false,
  checked,
  onChange,
  disabled,
  ...props
}: Omit<FormControlLabelProps, 'control' | 'label'> & {
  helperText?: React.ReactNode;
  label?: React.ReactNode;
  error?: boolean;
  loading?: boolean;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => {
  return (
    <StyledFormGroup style={style}>
      <StyledFormControlLabel 
        {...props} 
        label={label}
        disabled={disabled || loading}
        control={
          <SwitchContainer loading={loading}>
            <StyledSwitchField 
              loading={loading} 
              disabled={disabled || loading}
              checked={checked}
              onChange={onChange}
            />
            {loading && <LoadingSpinner />}
          </SwitchContainer>
        } 
      />
      {helperText && <FormHelperText disabled={disabled || loading} error={error}>{helperText}</FormHelperText>}
    </StyledFormGroup>
  );
};
