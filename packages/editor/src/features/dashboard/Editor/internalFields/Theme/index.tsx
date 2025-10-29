import { ColorField } from '@components/Form/Field/Color';
import { SliderField } from '@components/Form/Field/Slider';
import { SwitchField } from '@components/Form/Field/Switch';
import { Column, Row } from '@components/Layout';
import { FieldConfiguration, InternalRootComponentFields } from '@typings/fields';
import Color from 'color';
import { Blend, Lightbulb, LightbulbOff, PaintBucket, Palette } from 'lucide-react';
import styles from './Theme.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { generateColorSwatches } from '@helpers/color';
import { generateCssVariables } from '@helpers/color/generateCssVariables';
import { Tooltip } from '@components/Tooltip';
import { type Swatch } from '@helpers/color/primary';
import { useCallback } from 'react';
const cn = getClassNameFactory('Theme', styles);
function Swatch({ color }: { color: string }) {
  return <div className={cn('swatch')} style={{ backgroundColor: color }} />;
}

function SwatchesRow({ swatches, type }: { swatches: Swatch[]; type: 'primary' | 'surface' }) {
  return (
    <Row fullWidth justifyContent='space-evenly' gap={'var(--space-1)'} style={{ padding: 'var(--space-1)' }}>
      {swatches.map(s => {
        const cssVar = generateCssVariables({
          surface: [],
          primary: [],
          [type]: [s],
        });
        return (
          <Tooltip
            style={{
              display: 'flex',
            }}
            title={
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.55rem',
                }}
              >
                {cssVar}
              </pre>
            }
            key={s.label}
          >
            <Swatch key={s.label} color={s.color} />
          </Tooltip>
        );
      })}
    </Row>
  );
}

export const getThemeFields = (type: 'root' | 'component'): FieldConfiguration<{ theme: InternalRootComponentFields['theme'] }> => ({
  theme: {
    type: 'object',
    label: type === 'component' ? 'Theme Overrides' : 'Theme',
    collapseOptions: {
      startExpanded: false,
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
          const swatches = generateColorSwatches({
            primary: value.primary,
            surface: value.surface,
            lightMode: value.lightMode,
            tonalityMix: value.tonalityMix,
          });
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
                name={`${id}-primary`}
                label='Primary Color'
                icon={<Palette size={16} />}
                helperText='Base color for primary actions and highlights'
                value={value.primary}
                supportsGradient={false}
                onChange={v => onChange({ ...value, primary: v })}
              />
              <SwatchesRow swatches={swatches.primary} type='primary' />

              <ColorField
                id={`${id}-surface`}
                name={`${id}-surface`}
                icon={<PaintBucket size={16} />}
                label='Surface Color'
                helperText='Base color for surfaces and backgrounds'
                value={value.surface}
                supportsGradient={false}
                onChange={v => onChange({ ...value, surface: v })}
              />
              <SwatchesRow swatches={swatches.surface} type='surface' />
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
                label='Success Color'
                icon={<Palette size={16} />}
                helperText='Color used for success messages and indicators'
                value={value.semantics.success}
                supportsGradient={false}
                onChange={v => onChange({ ...value, semantics: { ...value.semantics, success: v } })}
              />
              <ColorField
                id={`${id}-semantics-warning`}
                name={`${id}-semantics-warning`}
                label='Warning Color'
                icon={<Palette size={16} />}
                helperText='Color used for warning messages and indicators'
                value={value.semantics.warning}
                supportsGradient={false}
                onChange={v => onChange({ ...value, semantics: { ...value.semantics, warning: v } })}
              />
              <ColorField
                id={`${id}-semantics-danger`}
                name={`${id}-semantics-danger`}
                label='Danger Color'
                icon={<Palette size={16} />}
                helperText='Color used for danger/error messages and indicators'
                value={value.semantics.danger}
                supportsGradient={false}
                onChange={v => onChange({ ...value, semantics: { ...value.semantics, danger: v } })}
              />
              <ColorField
                id={`${id}-semantics-info`}
                name={`${id}-semantics-info`}
                label='Info Color'
                icon={<Palette size={16} />}
                helperText='Color used for informational messages and indicators'
                value={value.semantics.info}
                supportsGradient={false}
                onChange={v => onChange({ ...value, semantics: { ...value.semantics, info: v } })}
              />
            </Column>
          );
        },
      },
    },
  },
});
