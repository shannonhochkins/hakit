import { ColorField } from '@components/Form/Field/Color';
import { SliderField } from '@components/Form/Field/Slider';
import { SwitchField } from '@components/Form/Field/Switch';
import { Column } from '@components/Layout';
import { FieldConfiguration, InternalRootComponentFields } from '@typings/fields';
import Color from 'color';
import { Blend, Lightbulb, LightbulbOff, PaintBucket, Palette } from 'lucide-react';
import { useCallback } from 'react';

export const getThemeFields = (type: 'root' | 'component'): FieldConfiguration<{ theme: InternalRootComponentFields['theme'] }> => ({
  theme: {
    type: 'object',
    label: type === 'component' ? 'Theme Overrides' : 'Theme',
    section: {
      expanded: false,
    },
    description:
      type === 'component'
        ? "Override theme settings for this component, this will regenerate the css variables scoped to this component and it's children"
        : 'Provide theme options for the dashboard',
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
          return data.theme.override;
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
});
