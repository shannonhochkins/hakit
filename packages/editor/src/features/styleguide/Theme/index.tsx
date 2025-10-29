import { useMemo, useState } from 'react';
import { Column, Row } from '@components/Layout';
import { Group } from '@components/Group';
import { ColorField } from '@components/Form/Field/Color';
import { generateColorSwatches } from '@helpers/color';
import { generateSemanticSwatches } from '@helpers/color/semantic';
import { generateCssVariables } from '@helpers/color/generateCssVariables';
import { SwitchField } from '@components/Form/Field/Switch';
import { SliderField } from '@components/Form/Field/Slider';
import Color from 'color';

const count = 10;

export function StyleguidePageTheme() {
  const [primaryColor, setPrimaryColor] = useState('#ED0707');
  const [surfaceColor, setSurfaceColor] = useState('#121212');
  const [successColor, setSuccessColor] = useState('#22946E');
  const [warningColor, setWarningColor] = useState('#A87A2A');
  const [dangerColor, setDangerColor] = useState('#9C2121');
  const [infoColor, setInfoColor] = useState('#21498A');
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<number | null>(null);
  const [lightMode, setLightMode] = useState(false);
  const [tonalityMix, setTonalityMix] = useState(0); // 0..1

  const swatches = useMemo(
    () => generateColorSwatches({ primary: primaryColor, surface: surfaceColor, lightMode, tonalityMix }),
    [primaryColor, surfaceColor, lightMode, tonalityMix]
  );
  const semantic = useMemo(
    () =>
      generateSemanticSwatches({
        lightMode,
        success: successColor,
        warning: warningColor,
        danger: dangerColor,
        info: infoColor,
      }),
    [lightMode, successColor, warningColor, dangerColor, infoColor]
  );

  const selectedWidth = 20; // %
  const collapsedWidth = count > 1 ? (100 - selectedWidth) / (count - 1) : 100;
  const getWidth = (i: number) => (selected == null ? `${100 / count}%` : i === selected ? `${selectedWidth}%` : `${collapsedWidth}%`);

  const surfaceLabelsCount = 8; // retain original interactive sizing
  const surfaceSelectedWidth = 20; // %
  const surfaceCollapsedWidth = surfaceLabelsCount > 1 ? (100 - surfaceSelectedWidth) / (surfaceLabelsCount - 1) : 100;
  const getSurfaceWidth = (i: number) =>
    selectedSurface == null
      ? `${100 / surfaceLabelsCount}%`
      : i === selectedSurface
        ? `${surfaceSelectedWidth}%`
        : `${surfaceCollapsedWidth}%`;

  const tokenBlock = useMemo<string>(() => {
    const primaryLines = [
      '/** Theme css colors (primary, surface, semantic) */',
      generateCssVariables({ ...swatches, semantics: semantic }),
    ];
    return primaryLines.join('\n');
  }, [swatches, semantic]);

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Row
        fullWidth
        alignItems='center'
        justifyContent='space-between'
        style={{ marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 16 }}
      >
        <ColorField hideControls id='primaryColor' label='Primary Color' value={primaryColor} onChange={val => setPrimaryColor(val)} />
        <ColorField hideControls id='surfaceColor' label='Surface Color' value={surfaceColor} onChange={val => setSurfaceColor(val)} />
        <ColorField hideControls id='successColor' label='Success Color' value={successColor} onChange={val => setSuccessColor(val)} />
        <ColorField hideControls id='warningColor' label='Warning Color' value={warningColor} onChange={val => setWarningColor(val)} />
        <ColorField hideControls id='dangerColor' label='Danger Color' value={dangerColor} onChange={val => setDangerColor(val)} />
        <ColorField hideControls id='infoColor' label='Info Color' value={infoColor} onChange={val => setInfoColor(val)} />
        <SwitchField
          id='lightMode'
          label='Light Mode'
          checked={lightMode}
          onChange={e => {
            const checked = (e.target as HTMLInputElement).checked;
            // using the "color" package, determine if the current surface value should be retrieved from the opposite space
            // for example, if switching to light mode and the surface is very dark, we may want to adjust it to a lighter color
            const isCurrentValueDark = Color(surfaceColor).isDark();
            const surfaceColorNew = checked
              ? isCurrentValueDark
                ? Color(surfaceColor).negate().rgb().toString()
                : surfaceColor
              : Color(surfaceColor).isLight()
                ? '#121212'
                : surfaceColor;
            setSurfaceColor(surfaceColorNew);
            setLightMode(checked);
          }}
        />
        <SliderField
          id='tonality-mix'
          name='tonality-mix'
          label={`Tonality Mix (${Math.round(tonalityMix * 100)}%)`}
          value={Math.round(tonalityMix * 100)}
          min={0}
          max={100}
          step={1}
          onChange={val => setTonalityMix((val as number) / 100)}
        />
      </Row>

      <Group title='Default (left-aligned)'>
        <div style={{ color: '#EDEDED', background: surfaceColor, padding: 16, borderRadius: 12, width: 'calc(100% - 24px)' }}>
          <div
            style={{ marginBottom: 12, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}
          >
            <strong>Primary Base:</strong> <code>{primaryColor}</code>
          </div>

          <div style={{ display: 'flex', flexWrap: 'nowrap', width: '100%', gap: 8, alignItems: 'stretch', marginBottom: 16 }}>
            {swatches.primary.map(({ label, color, textColor }, i) => {
              const isSel = selected === i;
              return (
                <button
                  key={`primary-${label}`}
                  onClick={() => setSelected(isSel ? null : i)}
                  aria-pressed={isSel}
                  title={`${label}: ${color}`}
                  style={{
                    height: 150,
                    borderRadius: 12,
                    position: 'relative',
                    transition: 'flex-basis 200ms ease, width 200ms ease',
                    flex: `1 1 ${getWidth(i)}`,
                    width: getWidth(i),
                    background: color,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      bottom: 10,
                      right: 10,
                      color: textColor || '#fff',
                      fontSize: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {isSel ? (
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '6px 8px',
                          borderRadius: 8,
                          background: 'rgba(0,0,0,0.45)',
                          border: '1px solid rgba(255,255,255,0.18)',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 12, opacity: 0.9 }}>{label}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>{color}</div>
                      </div>
                    ) : (
                      <div style={{ opacity: 0.85 }}>{label}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{ marginBottom: 8, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}
          >
            <strong>Surface Base:</strong> <code>{surfaceColor}</code>
          </div>

          <div style={{ display: 'flex', flexWrap: 'nowrap', width: '100%', gap: 8, alignItems: 'stretch', marginBottom: 32 }}>
            {swatches.surface.map(({ label, color, textColor }, i) => {
              const isSel = selectedSurface === i;
              return (
                <button
                  key={`surface-${label}`}
                  onClick={() => setSelectedSurface(isSel ? null : i)}
                  aria-pressed={isSel}
                  title={`${label}: ${color}`}
                  style={{
                    height: 150,
                    border: 'none',
                    borderRadius: 12,
                    position: 'relative',
                    transition: 'flex-basis 200ms ease, width 200ms ease',
                    flex: `1 1 ${getSurfaceWidth(i)}`,
                    width: getSurfaceWidth(i),
                    background: color,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      bottom: 10,
                      right: 10,
                      color: textColor || '#fff',
                      fontSize: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {isSel ? (
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '6px 8px',
                          borderRadius: 8,
                          background: 'rgba(0,0,0,0.45)',
                          border: '1px solid rgba(255,255,255,0.18)',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 12, opacity: 0.9 }}>{label}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>{color}</div>
                      </div>
                    ) : (
                      <div style={{ opacity: 0.85 }}>{label}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{ marginBottom: 12, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}
          >
            <strong>Semantic Scales:</strong>
          </div>
          <div
            style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', width: '100%', marginBottom: 24 }}
          >
            {Object.entries(semantic).map(([name, scale]) => (
              <div key={name} style={{ background: '#181818', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{name}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {scale.map(s => (
                    <div
                      key={s.label}
                      title={`${name}-${s.label}: ${s.color}`}
                      style={{
                        flex: '1 1 0',
                        height: 70,
                        background: s.color,
                        borderRadius: 8,
                        position: 'relative',
                        overflow: 'hidden',
                        fontSize: 10,
                        color: s.textColor || '#fff',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.35)', borderTopRightRadius: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: 'pointer' }}>Show generated CSS variables</summary>
            <pre
              style={{
                background: '#0E0E0E',
                color: '#D6D6D6',
                padding: 12,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                overflowX: 'auto',
              }}
            >
              {tokenBlock}
            </pre>
          </details>
        </div>
      </Group>
    </Column>
  );
}
