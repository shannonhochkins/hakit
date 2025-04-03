import { Slider, SliderProps } from '../Slider';
export function GridField({ onChange, value, debounceThrottleValue = 25, debounceType = 'throttle', ...props }: SliderProps) {
  return (
    <Slider
      debounceThrottleValue={debounceThrottleValue}
      debounceType={debounceType}
      value={value}
      onChange={onChange}
      {...props}
      formatTooltipValue={val => {
        // value is 1-12, representing the number of columns, show a percentage in the tooltip
        return `${Math.round((val * 100) / 12)}%`;
      }}
    />
  );
}
