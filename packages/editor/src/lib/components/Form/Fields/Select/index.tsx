import {
  MenuItem,
  Select as MuiSelect,
  SelectProps
} from '@mui/material';
import styled from '@emotion/styled';
import React from 'react';

const StyledMenuItem = styled(MenuItem)`
  background: var(--color-gray-800);
  color: var(--color-gray-100);
  &:hover, &:focus, &:active {
    background: var(--color-gray-700);
    color: var(--color-gray-100);
  }
  &.Mui-selected {
    background: var(--color-primary-500);
    color: var(--color-gray-50);
    &:hover, &:focus, &:active {
      background: var(--color-primary-500);
      color: var(--color-gray-50);
    }
  }  
`;

const StyledSelect = styled(MuiSelect)`
  color: currentColor;
  svg {
    color: currentColor;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-gray-800);
  }
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-gray-600);
  }
` as unknown as typeof MuiSelect;

export const SelectField = <Option,>({
  getOptionLabel,
  onChange,
  value,
  options,
  style = {},
  ...props
}: Omit<SelectProps<Option>, 'value'> & {
  value: Option;
  options: Option[];
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
