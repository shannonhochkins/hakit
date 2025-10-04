import { CSSProperties } from 'react';
import { CustomComponentConfig, RenderProps } from '@typings/puck';
import styles from './RootComponent.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
const getClassName = getClassNameFactory('RootComponent', styles);

const defaultBackground = new URL('./default-background.jpg', import.meta.url).href;
interface BackgroundProps {
  test: { foo: string };
  /** whether to use a background image or not @default true */
  useBackgroundImage: boolean;
  /** the background image to apply to the dashboard @default defaultBackground */
  backgroundImage?: string;
  /** overlay color drawn over the image (supports gradients/alpha) */
  overlayColor?: string;
  /** overlay blend mode to tint/merge overlay over the image @default "multiply" */
  overlayBlendMode?: CSSProperties['mixBlendMode'];
  /** the blur amount to apply to the background image of the dashboard @default 15 */
  blur?: number;
  /** the opacity of the background overlay color @default 0.9 */
  overlayOpacity?: number;
  /** CSS background-size value or 'custom' to use backgroundSizeCustom */
  backgroundSize?: string;
  /** custom CSS background-size when backgroundSize is 'custom' */
  backgroundSizeCustom?: string;
  /** CSS background-position, e.g. 'center center' */
  backgroundPosition?: string;
  /** CSS background-repeat */
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'space' | 'round';
  /** CSS background-attachment */
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  /** Optional image filters */
  useAdvancedFilters?: boolean;
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturate?: number;
  filterGrayscale?: number;
  /** Optional radial glow overlay controls - removed */
}

export type DefaultRootProps = {
  background: BackgroundProps;
};
export const defaultRootConfig: CustomComponentConfig<DefaultRootProps> = {
  label: 'Root',
  fields: {
    background: {
      type: 'object',
      collapseOptions: {
        startExpanded: true,
      },
      label: 'Background options',
      description: 'General options for the main background',
      objectFields: {
        test: {
          type: 'custom',
          label: 'Test',
          default: { foo: '' },
          render: ({ value }) => <>{value.foo}</>,
        },
        useBackgroundImage: {
          type: 'switch',
          label: 'Use Background Image',
          description: 'Whether to use a background image or not',
          default: true,
        },
        backgroundImage: {
          type: 'imageUpload',
          label: 'Background Image',
          description: 'The entity to display in the button card',
          default: undefined,
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        backgroundSize: {
          type: 'select',
          label: 'Background Size',
          description: 'CSS background-size value',
          default: 'cover',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: 'Auto', value: 'auto' },
            { label: 'Custom…', value: 'custom' },
          ],
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        backgroundSizeCustom: {
          type: 'text',
          label: 'Custom Background Size',
          description: 'Any valid CSS background-size value',
          default: '',
          visible(data) {
            return (data.background?.backgroundSize ?? 'cover') === 'custom' && (data.background?.useBackgroundImage ?? true);
          },
        },
        backgroundPosition: {
          type: 'text',
          label: 'Background Position',
          description: 'CSS background-position (e.g., "center center", "top", "50% 50%")',
          default: 'center center',
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        backgroundRepeat: {
          type: 'select',
          label: 'Background Repeat',
          description: 'CSS background-repeat',
          default: 'no-repeat',
          options: [
            { label: 'No Repeat', value: 'no-repeat' },
            { label: 'Repeat', value: 'repeat' },
            { label: 'Repeat X', value: 'repeat-x' },
            { label: 'Repeat Y', value: 'repeat-y' },
            { label: 'Space', value: 'space' },
            { label: 'Round', value: 'round' },
          ],
          visible(data) {
            return data.background?.useBackgroundImage ?? true;
          },
        },
        overlayColor: {
          type: 'color',
          label: 'Overlay Color',
          description: 'Background color or gradient. If an image is enabled, this tints the image; otherwise it becomes the background.',
          default: '#4254c5',
        },
        overlayBlendMode: {
          type: 'select',
          label: 'Overlay Blend Mode',
          description: 'How the overlay color blends with the image',
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
          min: 0,
          description: 'Blur amount applied to the background image',
          default: 25,
        },
        overlayOpacity: {
          type: 'number',
          label: 'Overlay Opacity',
          description: 'Opacity applied to the overlay color',
          default: 0.9,
          min: 0,
          max: 1,
          step: 0.1,
        },
        useAdvancedFilters: {
          type: 'switch',
          label: 'Use Advanced Filters',
          description: 'Enable image filters like brightness, contrast, saturation and grayscale',
          default: false,
        },
        filterBrightness: {
          type: 'number',
          label: 'Brightness',
          description: 'CSS filter brightness()',
          default: 1,
          min: 0,
          max: 3,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
        filterContrast: {
          type: 'number',
          label: 'Contrast',
          description: 'CSS filter contrast()',
          default: 1,
          min: 0,
          max: 3,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
        filterSaturate: {
          type: 'number',
          label: 'Saturate',
          description: 'CSS filter saturate()',
          default: 1,
          min: 0,
          max: 3,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
        filterGrayscale: {
          type: 'number',
          label: 'Grayscale',
          description: 'CSS filter grayscale()',
          default: 0,
          min: 0,
          max: 1,
          step: 0.05,
          visible(data) {
            return data.background?.useAdvancedFilters ?? false;
          },
        },
      },
    },
  },
  render: Render,
};

function Render(props: RenderProps<DefaultRootProps>) {
  const { background } = props;
  const bgSize =
    background?.backgroundSize === 'custom' ? background?.backgroundSizeCustom || 'cover' : background?.backgroundSize || 'cover';
  const bgImageUrl = background?.useBackgroundImage
    ? `url(${background?.backgroundImage ? background.backgroundImage : defaultBackground})`
    : '';
  return (
    <>
      <div className={getClassName()}>
        <div
          className={getClassName('background')}
          style={
            {
              '--root-component-overlay-color': background?.overlayColor,
              '--root-component-overlay-blendMode': background?.overlayBlendMode,
              '--root-component-overlay-opacity': background?.overlayOpacity,
              '--root-component-background-blur': `${background?.blur ?? 0}px`,
              '--root-component-background-image': bgImageUrl,
              '--root-component-background-size': bgSize,
              '--root-component-background-position': background?.backgroundPosition,
              '--root-component-background-repeat': background?.backgroundRepeat,
              '--root-component-filter-brightness': background?.filterBrightness,
              '--root-component-filter-contrast': background?.filterContrast,
              '--root-component-filter-saturate': background?.filterSaturate,
              '--root-component-filter-grayscale': background?.filterGrayscale,
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}
