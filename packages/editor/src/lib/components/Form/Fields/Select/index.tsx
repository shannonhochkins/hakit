import {
  MenuItem,
  // type MenuItemProps,
  Select as MuiSelect,
  SelectProps
} from '@mui/material';
import styled from '@emotion/styled';
import React from 'react';

const StyledMenuItem = styled(MenuItem)`
  background: var(--puck-color-grey-06);
  color: var(--puck-color-grey-02);
  &:hover, &:focus, &:active {
    background: var(--puck-color-grey-05);
    color: var(--puck-color-grey-02);
  }
  &.Mui-selected {
    background: var(--puck-color-azure-06);
    color: var(--puck-color-grey-01);
    &:hover, &:focus, &:active {
      background: var(--puck-color-azure-06);
      color: var(--puck-color-grey-01);
    }
  }
`

const StyledSelect = styled(MuiSelect)`
  color: currentColor;
  svg {
    color: currentColor;
  }
` as unknown as typeof MuiSelect;

export const SelectField = <Option,>({
  // getOptionValue,
  getOptionLabel,
  onChange,
  value,
  options,
  style = {},
  ...props
}: Omit<SelectProps<Option>, 'value'> & {
  value: Option;
  options: Option[];
  // getOptionValue: (option: Option) => MenuItemProps['value'];
  getOptionLabel: (option: Option) => React.ReactNode;
}) => {
  return (
    <StyledSelect
      onChange={onChange}
      value={value}
      style={{
        ...style,
        maxWidth: style?.maxWidth ?? '100%',
      }}
      {...props}
    >
      {options.map((option, index) => (
        <StyledMenuItem key={index} value={option as string} selected>
          {getOptionLabel(option)}
        </StyledMenuItem>
      ))}
    </StyledSelect>
  );
};
