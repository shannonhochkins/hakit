import GradientPicker from 'react-best-gradient-color-picker';
import { useState } from 'react';
import { useClickAway } from '@editor/hooks/useClickAway';
import styled from '@emotion/styled';

const Swatch = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 3px solid #fff;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
`;

const Picker = styled.div`
  position: relative;
  z-index: 10;
`;

const Popover = styled.div`
  position: absolute;
  transform: translate3d(0, -50%, 0);
  left: 38px;
  border-radius: 9px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background-color: #111;
  padding: 6px;
  /* Pseudo-element for arrow */
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    margin-top: -13px;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 10px 10px 0;
    border-color: transparent #111 transparent transparent;
    transform: translateX(-100%) translateY(-50%);
  }
`;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => {
    setIsOpen(false);
  });
  return (
    <Picker className='picker'>
      <Swatch className='swatch' style={{ background: `${value}` }} onClick={() => setIsOpen(true)} />
      {isOpen && (
        <Popover className='popover' ref={ref}>
          <GradientPicker
            hideAdvancedSliders
            hideColorGuide
            hidePresets
            width={250}
            height={150}
            value={value ?? 'transparent'}
            onChange={color => {
              onChange(color);
            }}
          />
        </Popover>
      )}
    </Picker>
  );
};
