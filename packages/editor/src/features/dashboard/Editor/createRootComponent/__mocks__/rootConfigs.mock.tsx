import { CustomRootConfigWithRemote } from '@features/dashboard/PuckDynamicConfiguration';
import { CSSProperties } from 'react';

type RootProps = {
  background: BackgroundProps;
};

interface BackgroundProps {
  /** whether to use a background image or not @default true */
  useBackgroundImage: boolean;
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
}

export const rootConfigs: [CustomRootConfigWithRemote<RootProps>] = [
  {
    defaultProps: {
      background: {
        useBackgroundImage: true,
        backgroundImage: '',
        backgroundColor: '#4254c5',
        blendMode: 'multiply',
        blur: 25,
        opacity: 0.9,
      },
    },
    label: 'Root',
    fields: {
      background: {
        type: 'object',
        label: 'Background options',
        description: 'General options for the main background',
        objectFields: {
          useBackgroundImage: {
            type: 'switch',
            label: 'Use Background Image',
            description: 'Whether to use a background image or not',
            default: true,
          },
          backgroundImage: {
            type: 'imageUpload',
            label: 'Background Image t',
            description: 'The entity to display in the button card',
            default: '',
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
              {
                label: 'Color',
                value: 'color',
              },
              {
                label: 'Color Burn',
                value: 'color-burn',
              },
              {
                label: 'Color Dodge',
                value: 'color-dodge',
              },
              {
                label: 'Darken',
                value: 'darken',
              },
              {
                label: 'Difference',
                value: 'difference',
              },
              {
                label: 'Exclusion',
                value: 'exclusion',
              },
              {
                label: 'Hard Light',
                value: 'hard-light',
              },
              {
                label: 'Hue',
                value: 'hue',
              },
              {
                label: 'Lighten',
                value: 'lighten',
              },
              {
                label: 'Luminosity',
                value: 'luminosity',
              },
              {
                label: 'Multiply',
                value: 'multiply',
              },
              {
                label: 'Normal',
                value: 'normal',
              },
              {
                label: 'Overlay',
                value: 'overlay',
              },
              {
                label: 'Saturation',
                value: 'saturation',
              },
              {
                label: 'Screen',
                value: 'screen',
              },
              {
                label: 'Soft Light',
                value: 'soft-light',
              },
            ],
          },
          blur: {
            type: 'number',
            label: 'Blur',
            min: 0,
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
    _remoteAddonId: '@hakit/default-root',
    _remoteAddonName: '@hakit/editor',
    styles: props => {
      return `background-color: ${props.background?.backgroundColor || '#ffffff'};
      background-image: url(${props.background?.useBackgroundImage ? props.background?.backgroundImage : ''});
      background-blend-mode: ${props.background?.blendMode || 'multiply'};
      opacity: ${props.background?.opacity || 1};
      filter: blur(${props.background?.blur || 0}px);`;
    },
    render() {
      return <></>;
    },
  },
];
