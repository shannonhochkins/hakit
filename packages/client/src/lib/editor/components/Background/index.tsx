import { createComponent } from '@editor/components';
import styled from '@emotion/styled';
import { CSSProperties } from 'react';

const BackgroundElement = styled.div<BackgroundProps['options']>`
  width: 100%;
  height: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  /* pointer-events: none;   */
  filter: ${({ blur }) => (blur ? `blur(${blur}px)` : 'none')};
  ${({ backgroundImage, backgroundColor, opacity, blendMode }) => `
    ${backgroundImage ? `background-image: url(${backgroundImage});` : ''}
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: inherit;
      opacity: ${opacity};
      background: ${backgroundColor};
      mix-blend-mode: ${blendMode};
    }
    &:after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at top center, ${backgroundColor} 0%, rgba(255, 255, 255, 0) 100%);
      width: 80vw;
      height: 80vh;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      mix-blend-mode: color-dodge;
    }
  `}
`;

const BackgroundWrapper = styled.div`
  position: absolute !important;
  inset: 0;
  z-index: -1;
  pointer-events: none;
`;

interface BackgroundProps {
  options: {
    /** the background image to apply to the dashboard @default defaultBackground */
    backgroundImage?: string;
    /** the background color to apply to the background overlay color @default "#4254c5" */
    backgroundColor?: string;
    /** the blend mode to apply to the background overlay color, this essentially applies an effect to the image @default "multiply" */
    blendMode?: CSSProperties['mixBlendMode'];
    /** the blur amount to apply to the background image of the dashboard @default 15 */
    blur?: number;
    /** the opacity of the background overlay color @default 0.9 */
    opacity?: number;
  };
}

const component = createComponent<BackgroundProps>({
  label: 'Background',
  category: 'Misc',
  fields: {
    options: {
      type: 'object',
      label: 'Background options',
      description: 'General options for the main background',
      default: {},
      disableBreakpoints: true,
      collapsible: {
        open: true,
      },
      objectFields: {
        backgroundImage: {
          type: 'imageUpload',
          label: 'Background Image',
          description: 'The entity to display in the button card',
          default: undefined,
        },
        backgroundColor: {
          type: 'color',
          label: 'Background Color',
          description: 'The background color of the button card',
          default: '#4254c5',
        },
        blendMode: {
          type: 'select',
          label: 'Blend Mode',
          description: 'The blend mode to apply to the background overlay color',
          default: 'multiply',
          options: [
            { label: 'Color', value: 'color' },
            { label: 'Color Burn', value: 'color-burn' },
            { label: 'Color Dodge', value: 'color-dodge' },
            { label: 'Darken', value: 'darken' },
            { label: 'Difference', value: 'difference' },
            { label: 'Exclusion', value: 'exclusion' },
            { label: 'Hard Light', value: 'hard-light' },
            { label: 'Hue', value: 'hue' },
            { label: 'Lighten', value: 'lighten' },
            { label: 'Luminosity', value: 'luminosity' },
            { label: 'Multiply', value: 'multiply' },
            { label: 'Normal', value: 'normal' },
            { label: 'Overlay', value: 'overlay' },
            { label: 'Saturation', value: 'saturation' },
            { label: 'Screen', value: 'screen' },
            { label: 'Soft Light', value: 'soft-light' },
          ],
        },
        blur: {
          type: 'number',
          label: 'Blur',
          description: 'The blur amount to apply to the background image of the dashboard',
          default: 25,
        },
        opacity: {
          type: 'number',
          label: 'Opacity',
          description: 'The opacity of the background overlay color',
          default: 0.9,
          min: 0,
          max: 1,
          step: 0.1,
        },
      },
    },
  },
  permissions: { delete: false, drag: false, duplicate: false, edit: true, insert: false },
  inline: true,
  render: ({ puck, options }) => {
    return (
      <BackgroundWrapper ref={puck.dragRef}>
        <BackgroundElement
          blendMode={options?.blendMode}
          backgroundColor={options?.backgroundColor}
          backgroundImage={options?.backgroundImage ? `/assets/${options?.backgroundImage}` : ''}
          blur={options?.blur}
          opacity={options?.opacity}
        />
      </BackgroundWrapper>
    );
  },
});

export default component;
