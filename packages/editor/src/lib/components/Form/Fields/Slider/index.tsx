import styled from '@emotion/styled';
import { RangeSlider, type RangeSliderProps } from '@hakit/components';

const SliderWrapper = styled(RangeSlider)`
  .range-slider-range {
    background: var(--color-gray-950) !important;

    &::-webkit-slider-thumb {
      background: var(--color-gray-400) !important;
      transition: background var(--transition-normal) !important;
      &:hover {
        background: var(--color-secondary-400) !important;
      }
    }

    &:active::-webkit-slider-thumb {
      background: var(--color-gray-400) !important;
    }

    &::-moz-range-thumb {
      background: var(--color-gray-400) !important;
      transition: background var(--transition-normal) !important;
      &:hover {
        background: var(--color-secondary-400) !important;
      }
    }

    &:active::-moz-range-thumb {
      background: var(--color-gray-400) !important;
    }

    &:focus {
      &::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px var(--color-gray-50) !important;
      }
    }
  }

  .tooltip-holder {
    > div {
      background: var(--color-gray-400) !important;
    }
  }

  // Firefox Overrides
  ::-moz-range-track {
    background: var(--color-gray-950) !important;
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
