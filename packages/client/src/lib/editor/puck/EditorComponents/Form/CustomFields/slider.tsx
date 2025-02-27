import styled from '@emotion/styled';
import { RangeSlider, type RangeSliderProps } from '@hakit/components';

const SliderWrapper = styled(RangeSlider)`
  .range-slider-range {
    background: var(--puck-color-grey-11) !important;

    &::-webkit-slider-thumb {
      background: var(--puck-color-grey-05) !important;
      transition: background var(--transition-duration) var(--easing) !important;
      &:hover {
        background: var(--puck-color-azure-05) !important;
      }
    }

    &:active::-webkit-slider-thumb {
      background: var(--puck-color-grey-05) !important;
    }

    &::-moz-range-thumb {
      background: var(--puck-color-grey-05) !important;
      transition: background var(--transition-duration) var(--easing) !important;
      &:hover {
        background: var(--puck-color-azure-05) !important;
      }
    }

    &:active::-moz-range-thumb {
      background: var(--puck-color-grey-05) !important;
    }

    &:focus {
      &::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px var(--puck-color-grey-01) !important;
      }
    }
  }

  .tooltip-holder {
    > div {
      background: var(--puck-color-grey-05) !important;
    }
  }

  // Firefox Overrides
  ::-moz-range-track {
    background: var(--puck-color-grey-11) !important;
  }
`;
export type SliderProps = Omit<RangeSliderProps, 'onChange'> & {
  onChange?: (value: number) => void;
};

export function Slider({ value, onChange, ...rest }: SliderProps) {
  return (
    <SliderWrapper
      debounceType='throttle'
      debounceThrottleValue={250}
      value={value}
      onChangeComplete={value => {
        onChange?.(value);
      }}
      {...rest}
    />
  );
}
