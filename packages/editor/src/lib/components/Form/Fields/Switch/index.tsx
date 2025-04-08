import styled from '@emotion/styled';
import { Switch, FormControlLabel, FormControlLabelProps, FormHelperText, FormGroup } from '@mui/material';

const StyledFormControlLabel = styled(FormControlLabel)`
  padding-top: 12px;
  .MuiFormControlLabel-label.Mui-disabled {
    color: var(--puck-color-grey-04);
  }
`;

const StyledFormGroup = styled(FormGroup)`
  .MuiFormHelperText-root:not(.Mui-error) {
    color: var(--puck-color-grey-04);
    &.Mui-disabled {
      color: var(--puck-color-grey-05);
    }
  }
`

const StyledSwitchField = styled(Switch)`
  // unchecked state
  .MuiSwitch-thumb {
    background-color: var(--puck-color-azure-02);
  }
  .MuiSwitch-switchBase + .MuiSwitch-track {
    background-color: var(--puck-color-grey-05);
  }
  .MuiSwitch-switchBase.Mui-disabled {
    color: var(--puck-color-grey-04);
  }
  .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track {
    background-color: var(--puck-color-grey-03);
  }
  // checked states
  .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb {
    background-color: var(--puck-color-azure-06);
  }
  .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {
    background-color: var(--puck-color-grey-05);
  }  
  .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track {
    background-color: var(--puck-color-grey-03);
  }
  .MuiSwitch-switchBase.Mui-checked.Mui-disabled {
    color: var(--puck-color-grey-04);
  }
`;

export const SwitchField = ({
  helperText,
  error,
  style,
  label = '',
  ...props
}: Omit<FormControlLabelProps, 'control' | 'label'> & {
  helperText?: React.ReactNode;
  label?: React.ReactNode;
  error?: boolean;
}) => {
  return (
    <StyledFormGroup style={style}>
      <StyledFormControlLabel {...props} label={label} control={<StyledSwitchField />} />
      {helperText && <FormHelperText disabled={props.disabled} error={error}>{helperText}</FormHelperText>}
    </StyledFormGroup>
  );
};
