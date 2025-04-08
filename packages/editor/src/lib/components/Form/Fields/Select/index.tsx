import Select, { Props as SelectProps } from "react-select";
import styled from '@emotion/styled';

// Generic wrapper type to support automatic inference
type SelectFieldProps<Option = unknown, IsMulti extends boolean = false> = SelectProps<Option, IsMulti> & {
  inline?: boolean;
};

const StyledSelect = styled(Select)`
  &.react-select--inline {
    display: inline-block;
    margin: 0 0.25em;
  }

  /* Remove border, outline, box-shadow, and min-height values */
  &.react-select--inline .react-select__control {
    border: none;
    outline: none;
    box-shadow: none;
    min-height: 0;
    cursor: pointer;
    background: transparent;
  }

  /* Tighten up spacing */
  &.react-select--inline .react-select__value-container {
    padding: 0;
  }

  /* Position value relative (instead of absolute) and remove transform and max-width */
  &.react-select--inline .react-select__single-value {
    font-weight: inherit;
    position: relative;
    transform: none;
    max-width: none;
    color: currentColor;
  }

  /* CSS triangle dropdown indicator next to selected value */
  &.react-select--inline .react-select__single-value::after {
    content: " ";
    position: relative;
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 4px 0 4px;
    border-color: currentColor transparent transparent transparent;

    margin-left: 0.25em;
    top: -0.125em;
  }

  &.react-select--inline .react-select__menu {
    background: var(--puck-color-grey-12);
    min-width: 150px;
  }
  .react-select__option {
    background: var(--puck-color-grey-06);
    color: var(--puck-color-grey-02);
    cursor: pointer;
    &:hover, &:focus, &:active {
      background: var(--puck-color-grey-05);
      color: var(--puck-color-grey-01);
    }
    &--is-selected {
      background: var(--puck-color-grey-05);
      color: var(--puck-color-grey-01);
    }
  }
`;

export const SelectField = <Option = unknown, IsMulti extends boolean = false>(props: SelectFieldProps<Option, IsMulti>) => {

  return (
    <StyledSelect
      classNamePrefix="react-select"
      className={`react-select--${props.inline ? 'inline' : 'block'}`}
      components={{
        // @ts-expect-error - fix later
        IndicatorsContainer: () => null,
      }}
      isSearchable={false}
      {...props}
    />
  );
};
