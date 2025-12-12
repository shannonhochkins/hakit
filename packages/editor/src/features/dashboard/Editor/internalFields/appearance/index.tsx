import { ColorField } from '@components/Form/Field/Color';
import { SliderField } from '@components/Form/Field/Slider';
import { SwitchField } from '@components/Form/Field/Switch';
import { Column } from '@components/Layout';
import { FieldConfiguration, AppearanceFields } from '@typings/fields';
import Color from 'color';
import { Blend, Lightbulb, LightbulbOff, PaintBucket, Palette } from 'lucide-react';
import { useCallback } from 'react';
import React from 'react';
import { fontFamilyMap, googleFontsNameMap, Typography } from '../../Typography';
import { Alert } from '@components/Alert';

export const getAppearanceFields = <T extends 'root' | 'component'>(
  type: T
): FieldConfiguration<{
  // intentionally using a generic here
  // if there's fields that should be used for root, but not component or vice versa, we can handle that within the visible function
  $appearance: AppearanceFields;
}> => ({
  $appearance: {
    type: 'object',
    label: 'Appearance',
    section: {
      expanded: false,
    },
    description: 'Appearance settings for the page',
    objectFields: {
      design: {
        type: 'object',
        section: { expanded: false },
        label: type === 'root' ? 'Page Design' : 'Design',
        description: type === 'root' ? 'Configure the design for the entire page.' : 'Configure the design for this component only.',
        objectFields: {
          backgroundType: {
            type: 'select',
            label: 'Background Type',
            description: 'Type of background effect for the card',
            options: [
              { label: 'Color', value: 'color' },
              { label: 'Glass', value: 'glass' },
              { label: 'Liquid Glass', value: 'liquid-glass', description: 'Only works in Google Chrome' },
            ],
            default: 'color',
            visible() {
              return type !== 'root';
            },
          },
          liquidGlassWarning: {
            type: 'custom',
            label: 'Liquid Glass Warning',
            default: false,
            render() {
              return (
                <Column
                  style={{
                    padding: 'var(--space-3)',
                  }}
                >
                  <Alert severity='warning'>
                    Liquid Glass is only supported in Google Chrome. This is a performance intensive effect and should be used sparingly.
                  </Alert>
                </Column>
              );
            },
          },
          glassColor: {
            type: 'color',
            label: 'Glass Color',
            description: 'Tint color for the glass background, including alpha for transparency',
            default: 'rgba(255, 255, 255, 0.1)',
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'glass' || props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassBlurAmount: {
            type: 'slider',
            label: 'Glass Blur Amount',
            description: 'Amount of blur for the glass background',
            default: 5,
            step: 0.1,
            min: 0,
            max: 30,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'glass';
            },
          },
          glassOutline: {
            type: 'slider',
            label: 'Glass Outline',
            description: 'Outline thickness for the glass background',
            default: 1,
            step: 1,
            min: 0,
            max: 10,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'glass' || props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassOutlineTransparency: {
            type: 'slider',
            label: 'Glass Outline Transparency',
            description: 'Outline transparency for the glass background',
            default: 0.81,
            step: 0.01,
            min: 0,
            max: 1,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'glass' || props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassDisplacementScale: {
            type: 'slider',
            label: 'Displacement Scale',
            description: 'Refraction strength for liquid glass',
            default: 53,
            step: 1,
            min: 0,
            max: 200,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassSpecularOpacity: {
            type: 'slider',
            label: 'Specular Opacity',
            description: 'Alpha slope for specular layer (0..1)',
            default: 0.1,
            step: 0.01,
            min: 0,
            max: 1,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassSpecularSaturation: {
            type: 'slider',
            label: 'Glass Specular Saturation',
            description: 'Saturation applied after displacement',
            default: 2,
            step: 0.1,
            min: 0,
            max: 10,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassBlur: {
            type: 'slider',
            label: 'Glass Pre-Blur',
            description: 'Blur amount for the glass background before displacement',
            default: 2,
            step: 0.1,
            min: 0,
            max: 10,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },
          glassBackgroundOpacity: {
            type: 'slider',
            label: 'Glass Background Opacity',
            description: 'Opacity of the panel tint (0..1)',
            default: 0.1,
            step: 0.01,
            min: 0,
            max: 1,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'liquid-glass';
            },
          },

          backgroundColor: {
            type: 'color',
            label: 'Background Color',
            description: type === 'root' ? 'Base color for the page background.' : 'Base color for the background.',
            default: type === 'root' ? 'color-mix(in srgb, var(--clr-primary-a10) 90%, transparent 10%)' : undefined,
            visible(props) {
              return props.$appearance?.design?.backgroundType === 'color';
            },
          },
          useImage: {
            type: 'switch',
            label: 'Use Background Image',
            description:
              type === 'root'
                ? 'Enable to display a background image on the page.'
                : 'Enable to display a background image on this component.',
            default: false,
          },
          backgroundImage: {
            type: 'imageUpload',
            label: 'Background Image',
            description: type === 'root' ? 'Image to display as the page background.' : 'Image to display as the background.',
            default: undefined,
            visible(data) {
              return data.$appearance.design.useImage;
            },
          },
          backgroundImageBlendMode: {
            type: 'select',
            label: 'Background Image Blend Mode',
            description: 'Blend mode for the background image and color',
            default: 'normal',
            options: [
              { label: 'Normal', value: 'normal' },
              { label: 'Multiply', value: 'multiply' },
              { label: 'Screen', value: 'screen' },
              { label: 'Overlay', value: 'overlay' },
              { label: 'Darken', value: 'darken' },
              { label: 'Lighten', value: 'lighten' },
              { label: 'Color Dodge', value: 'color-dodge' },
              { label: 'Color Burn', value: 'color-burn' },
              { label: 'Hard Light', value: 'hard-light' },
              { label: 'Soft Light', value: 'soft-light' },
              { label: 'Difference', value: 'difference' },
              { label: 'Exclusion', value: 'exclusion' },
              { label: 'Hue', value: 'hue' },
              { label: 'Saturation', value: 'saturation' },
              { label: 'Color', value: 'color' },
              { label: 'Luminosity', value: 'luminosity' },
            ],
            visible(data) {
              return data.$appearance.design.useImage;
            },
          },
          backgroundSize: {
            type: 'select',
            label: 'Background Size',
            description: 'How the background image should be sized.',
            default: 'cover',
            options: [
              { label: 'Cover', value: 'cover' },
              { label: 'Contain', value: 'contain' },
              { label: 'Auto', value: 'auto' },
              { label: 'Custom…', value: 'custom' },
            ],
            visible(data) {
              return data.$appearance.design.useImage;
            },
          },
          backgroundSizeCustom: {
            type: 'text',
            label: 'Custom Background Size',
            description: 'Enter any valid CSS background-size value.',
            default: '',
            visible(data) {
              return (data.$appearance.design?.backgroundSize ?? 'cover') === 'custom' && data.$appearance.design.useImage;
            },
          },
          backgroundPosition: {
            type: 'text',
            label: 'Background Position',
            description: 'Position of the background image (e.g., "center center", "top", "50% 50%").',
            default: 'center center',
            visible(data) {
              return data.$appearance.design.useImage;
            },
          },
          backgroundRepeat: {
            type: 'select',
            label: 'Background Repeat',
            description: 'How the background image should repeat.',
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
              return data.$appearance.design.useImage;
            },
          },
          backgroundAttachment: {
            type: 'select',
            label: 'Background Attachment',
            description:
              type === 'root'
                ? 'Controls how the page background image scrolls with the page.'
                : 'Controls how the background image scrolls with the component.',
            default: type === 'root' ? 'fixed' : 'scroll',
            options: [
              { label: 'Scroll', value: 'scroll' },
              { label: 'Fixed', value: 'fixed' },
              { label: 'Local', value: 'local' },
            ],
            visible(data) {
              return data.$appearance.design.useImage;
            },
          },

          boxShadowEnabled: {
            type: 'switch',
            label: 'Enable Box Shadow',
            description: 'Toggle box shadow on or off',
            default: false,
            visible() {
              return type !== 'root';
            },
          },
          boxShadowColor: {
            type: 'color',
            label: 'Box Shadow Color',
            description: 'Color of the box shadow (supports transparency)',
            default: 'rgba(0,0,0,0.1)',
            visible(props) {
              return props.$appearance?.design?.boxShadowEnabled !== false && type !== 'root';
            },
          },
          boxShadowBlur: {
            type: 'slider',
            label: 'Box Shadow Blur',
            description: 'Blur radius for the box shadow',
            default: 30,
            step: 1,
            min: 0,
            max: 100,
            visible(props) {
              return props.$appearance?.design?.boxShadowEnabled !== false && type !== 'root';
            },
          },
          boxShadowSpread: {
            type: 'slider',
            label: 'Box Shadow Spread',
            description: 'Spread radius for the box shadow',
            default: 10,
            step: 1,
            min: 0,
            max: 100,
            visible(props) {
              return props.$appearance?.design?.boxShadowEnabled !== false && type !== 'root';
            },
          },
          borderRadius: {
            type: 'unit',
            label: 'Border Radius',
            description: 'Border radius of the card',
            default: undefined,
            supportsAllCorners: true,
            visible() {
              return type !== 'root';
            },
          },
          borderEnabled: {
            type: 'switch',
            label: 'Enable Border',
            description: 'Enable to add a border',
            default: false,
            visible(props) {
              return (
                props.$appearance?.design?.backgroundType !== 'glass' &&
                props.$appearance?.design?.backgroundType !== 'liquid-glass' &&
                type !== 'root'
              );
            },
          },
          borderWidth: {
            type: 'unit',
            label: 'Border Width',
            description: 'Width of the border',
            default: '1px',
            supportsAllCorners: true,
            visible(props) {
              return (
                props.$appearance?.design?.backgroundType !== 'glass' &&
                props.$appearance?.design?.backgroundType !== 'liquid-glass' &&
                props.$appearance?.design?.borderEnabled === true &&
                type !== 'root'
              );
            },
          },
          borderColor: {
            type: 'color',
            label: 'Border Color',
            description: 'Color of the border',
            default: 'var(--clr-primary-a90)',
            visible(props) {
              return (
                props.$appearance?.design?.backgroundType !== 'glass' &&
                props.$appearance?.design?.backgroundType !== 'liquid-glass' &&
                props.$appearance?.design?.borderEnabled === true &&
                type !== 'root'
              );
            },
          },
          borderStyle: {
            type: 'select',
            label: 'Border Style',
            description: 'Style of the border',
            default: 'solid',
            options: [
              { label: 'Solid', value: 'solid' },
              { label: 'Dashed', value: 'dashed' },
              { label: 'Dotted', value: 'dotted' },
              { label: 'Double', value: 'double' },
              { label: 'Groove', value: 'groove' },
              { label: 'Ridge', value: 'ridge' },
              { label: 'Inset', value: 'inset' },
              { label: 'Outset', value: 'outset' },
            ],
            visible(props) {
              return (
                props.$appearance?.design?.backgroundType !== 'glass' &&
                props.$appearance?.design?.backgroundType !== 'liquid-glass' &&
                props.$appearance?.design?.borderEnabled === true &&
                type !== 'root'
              );
            },
          },
        },
      },
      sizeAndSpacing: {
        type: 'object',
        section: {
          expanded: false,
        },
        label: 'Size & Spacing',
        description: 'Layout settings for the page',
        objectFields: {
          width: {
            type: 'unit',
            label: 'Width',
            description: 'Width of the container',
            default: 'auto',
          },
          height: {
            type: 'unit',
            label: 'Height',
            description: 'Height of the container',
            default: 'auto',
          },
          padding: {
            type: 'unit',
            label: 'Padding',
            description: 'Padding inside the container around the content area',
            default: '0rem',
            supportsAllCorners: true,
          },
          margin: {
            type: 'unit',
            label: 'Margin',
            description: 'Margin outside the container',
            default: '0rem',
            supportsAllCorners: true,
          },
        },
      },
      typography: {
        type: 'object',
        section: {
          expanded: false,
        },
        label: type === 'root' ? 'Typography' : 'Typography Overrides',
        description:
          type === 'root'
            ? 'Set the default typography styles for the entire page.'
            : 'Override typography styles for this component. By default, components inherit page typography unless "Override" is enabled.',
        objectFields: {
          override: {
            type: 'switch',
            label: 'Override Typography',
            description: 'Enable to override page typography for this component.',
            default: type === 'root',
            visible: () => type === 'component',
          },
          fontFamily: {
            type: 'select',
            label: type === 'root' ? 'Page Font Family' : 'Font Family',
            description:
              type === 'root'
                ? 'Select the font family used for all page text.'
                : 'Select the font family for this component. By default, it inherits from the page unless overridden.',
            default: 'roboto',
            options: [
              { label: 'System Font', value: 'system' },
              ...Object.entries(googleFontsNameMap).map(([value, label]) => ({ label: label.replace(/[+]/g, ' '), value })),
            ],
            renderOption(option) {
              return (
                <>
                  <Typography type='root' typography={{ fontFamily: option.value as keyof typeof googleFontsNameMap }} />
                  <span
                    style={{
                      fontFamily: fontFamilyMap[option.value as keyof typeof fontFamilyMap],
                    }}
                  >
                    {option.label}
                  </span>
                </>
              );
            },
            visible: data => (type === 'root' ? true : !!data.$appearance.typography.override),
          },
          useAdvancedTypography: {
            type: 'switch',
            label: 'Enable Advanced Typography',
            description:
              type === 'root'
                ? 'Enable advanced typography controls for the page, such as font weights and spacing.'
                : 'Enable advanced typography controls for this component.',
            default: false,
            visible: data => (type === 'root' ? true : !!data.$appearance.typography.override),
          },
          headingWeight: {
            type: 'select',
            label: 'Heading Weight',
            description:
              type === 'root'
                ? 'Set the font weight for page headings and titles.'
                : 'Set the font weight for headings and titles in this component.',
            default: 600,
            options: [
              { label: 'Light (300)', value: 300 },
              { label: 'Regular (400)', value: 400 },
              { label: 'Medium (500)', value: 500 },
              { label: 'Semi Bold (600)', value: 600 },
              { label: 'Bold (700)', value: 700 },
            ],
            visible: data =>
              type === 'root'
                ? !!data.$appearance.typography.useAdvancedTypography
                : !!data.$appearance.typography.override && !!data.$appearance.typography.useAdvancedTypography,
          },
          bodyWeight: {
            type: 'select',
            label: 'Body Weight',
            description:
              type === 'root' ? 'Set the font weight for page body text.' : 'Set the font weight for body text in this component.',
            default: 400,
            options: [
              { label: 'Light (300)', value: 300 },
              { label: 'Regular (400)', value: 400 },
              { label: 'Medium (500)', value: 500 },
              { label: 'Semi Bold (600)', value: 600 },
            ],
            visible: data =>
              type === 'root'
                ? !!data.$appearance.typography.useAdvancedTypography
                : !!data.$appearance.typography.override && !!data.$appearance.typography.useAdvancedTypography,
          },
          baseFontSize: {
            type: 'unit',
            label: 'Base Font Size',
            description: type === 'root' ? 'Set the base font size for all page text.' : 'Set the base font size for this component.',
            default: '16px',
            min: 12,
            max: 24,
            step: 1,
            visible: data =>
              type === 'root'
                ? !!data.$appearance.typography.useAdvancedTypography
                : !!data.$appearance.typography.override && !!data.$appearance.typography.useAdvancedTypography,
          },
          lineHeight: {
            type: 'number',
            label: 'Line Height',
            description:
              type === 'root'
                ? 'Set the line height multiplier for page text.'
                : 'Set the line height multiplier for text in this component.',
            default: 1.5,
            min: 1.2,
            max: 2.0,
            step: 0.1,
            visible: data =>
              type === 'root'
                ? !!data.$appearance.typography.useAdvancedTypography
                : !!data.$appearance.typography.override && !!data.$appearance.typography.useAdvancedTypography,
          },
          letterSpacing: {
            type: 'number',
            label: 'Letter Spacing',
            description: type === 'root' ? 'Set the letter spacing for page text.' : 'Set the letter spacing for text in this component.',
            default: 0,
            min: -1,
            max: 2,
            visible: data =>
              type === 'root'
                ? !!data.$appearance.typography.useAdvancedTypography
                : !!data.$appearance.typography.override && !!data.$appearance.typography.useAdvancedTypography,
            step: 0.1,
          },
        },
      },
      theme: {
        type: 'object',
        label: type === 'component' ? 'Theme Overrides' : 'Theme',
        section: {
          expanded: false,
        },
        description:
          type === 'component'
            ? 'Override theme settings for this component, this will regenerate the css variables scoped to this component and its children'
            : 'Provide theme options for the page',
        objectFields: {
          override: {
            type: 'switch',
            label: 'Enable Theme Overrides',
            description: 'Enable custom theme overrides for this component',
            default: type === 'root' ? true : false,
            visible: () => type === 'component',
          },
          colors: {
            type: 'custom',
            label: 'Theme Colors',
            default: {
              primary: 'rgb(27, 1, 204)',
              surface: 'rgb(18, 18, 18)',
              lightMode: false,
              tonalityMix: 0.3,
              semantics: {
                success: '#22946E',
                warning: '#A87A2A',
                danger: '#9C2121',
                info: '#21498A',
              },
            },
            visible(data) {
              return data.$appearance.theme.override;
            },
            render({ value, onChange, id }) {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const onSwitchChange = useCallback(
                (e: React.SyntheticEvent<HTMLInputElement>) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  // using the "color" package, determine if the current surface value should be retrieved from the opposite space
                  // for example, if switching to light mode and the surface is very dark, we may want to adjust it to a lighter color
                  const isCurrentValueDark = Color(value.surface).isDark();
                  const surfaceColor = checked
                    ? isCurrentValueDark
                      ? Color(value.surface).negate().rgb().toString()
                      : value.surface
                    : Color(value.surface).isLight()
                      ? '#121212'
                      : value.surface;
                  onChange({
                    ...value,
                    surface: surfaceColor,
                    lightMode: checked,
                  });
                },
                [onChange, value]
              );
              return (
                <Column
                  gap='var(--space-5)'
                  fullWidth
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                  }}
                >
                  <SwitchField
                    id={`${id}-lightMode`}
                    name={`${id}-lightMode`}
                    label='Light Mode'
                    icon={value.lightMode ? <Lightbulb size={16} /> : <LightbulbOff size={16} />}
                    helperText='Whether the dashboard should use light mode colors'
                    checked={value.lightMode}
                    onChange={onSwitchChange}
                  />
                  <ColorField
                    id={`${id}-primary`}
                    disableThemeAutocomplete
                    isWithinEditorContext
                    name={`${id}-primary`}
                    label='Primary Color'
                    icon={<Palette size={16} />}
                    helperText='Base color for primary actions and highlights'
                    value={value.primary}
                    hideControls
                    onChange={v => onChange({ ...value, primary: v })}
                  />

                  <ColorField
                    id={`${id}-surface`}
                    name={`${id}-surface`}
                    disableThemeAutocomplete
                    isWithinEditorContext
                    icon={<PaintBucket size={16} />}
                    label='Surface Color'
                    helperText='Base color for surfaces and backgrounds'
                    value={value.surface}
                    hideControls
                    onChange={v => onChange({ ...value, surface: v })}
                  />
                  <SliderField
                    id={`${id}-tonalityMix`}
                    name={`${id}-tonalityMix`}
                    label='Tonality Mix'
                    value={Math.round(value.tonalityMix * 100)}
                    min={0}
                    max={100}
                    step={1}
                    icon={<Blend size={16} />}
                    valueSuffix='%'
                    formatTooltipValue={v => `${v}%`}
                    helperText='Mix factor between primary and surface colors for component backgrounds (0 = primary, 1 = surface)'
                    onChange={val =>
                      onChange({
                        ...value,
                        tonalityMix: val / 100,
                      })
                    }
                  />
                  {/* semantic colors */}
                  <ColorField
                    id={`${id}-semantics-success`}
                    name={`${id}-semantics-success`}
                    disableThemeAutocomplete
                    isWithinEditorContext
                    label='Success Color'
                    icon={<Palette size={16} />}
                    helperText='Color used for success messages and indicators'
                    value={value.semantics.success}
                    hideControls
                    onChange={v => onChange({ ...value, semantics: { ...value.semantics, success: v } })}
                  />
                  <ColorField
                    id={`${id}-semantics-warning`}
                    disableThemeAutocomplete
                    isWithinEditorContext
                    name={`${id}-semantics-warning`}
                    label='Warning Color'
                    icon={<Palette size={16} />}
                    helperText='Color used for warning messages and indicators'
                    value={value.semantics.warning}
                    hideControls
                    onChange={v => onChange({ ...value, semantics: { ...value.semantics, warning: v } })}
                  />
                  <ColorField
                    id={`${id}-semantics-danger`}
                    disableThemeAutocomplete
                    isWithinEditorContext
                    name={`${id}-semantics-danger`}
                    label='Danger Color'
                    icon={<Palette size={16} />}
                    helperText='Color used for danger/error messages and indicators'
                    value={value.semantics.danger}
                    hideControls
                    onChange={v => onChange({ ...value, semantics: { ...value.semantics, danger: v } })}
                  />
                  <ColorField
                    id={`${id}-semantics-info`}
                    disableThemeAutocomplete
                    isWithinEditorContext
                    name={`${id}-semantics-info`}
                    label='Info Color'
                    icon={<Palette size={16} />}
                    helperText='Color used for informational messages and indicators'
                    value={value.semantics.info}
                    hideControls
                    onChange={v => onChange({ ...value, semantics: { ...value.semantics, info: v } })}
                  />
                </Column>
              );
            },
          },
        },
      },
    },
  },
});
