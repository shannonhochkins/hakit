import { describe, test, expect } from 'bun:test';
import { sanitizePuckData } from '../sanitizePuckData';
import { pageData as basePageData, userConfig } from './__mocks__/pageData';

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

describe('sanitizePuckData', () => {
  test('it should sanitize and retain all expected data and fields and not remove breakpoints', () => {
    const result = sanitizePuckData({
      data: deepClone(basePageData),
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: false,
    });
    expect(result).toMatchSnapshot();
  });
  test('it should sanitize and retain all expected data and fields and remove breakpoints', () => {
    const result = sanitizePuckData({
      data: deepClone(basePageData),
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: true,
    });
    expect(result).toMatchSnapshot();
  });
  test('should trim root to configured fields, resolve breakpoint values for xlg, and merge defaults', () => {
    const result = sanitizePuckData({
      data: deepClone(basePageData),
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: true,
    });

    expect(result).not.toBeNull();
    if (!result) return;

    // content slot should be retained under root.props
    expect(result.root?.props?.content).toBeDefined();
    // _activeBreakpoint is skipped so it should not be stored in db
    expect(result.root?.props?._activeBreakpoint).not.toBeUndefined();

    // Ensure the remote object exists and has resolved values
    const rootRemote = result.root?.props?.['@hakit/default-root'] as unknown as Record<string, unknown> | undefined;
    expect(rootRemote).toBeDefined();
    const background = rootRemote?.background as unknown as Record<string, unknown> | undefined;
    const typography = rootRemote?.typography as unknown as Record<string, unknown> | undefined;
    expect(background).toBeDefined();
    expect(typography).toBeDefined();

    // Background values should be flattened to xlg values
    expect(background).toMatchObject({
      useBackgroundImage: true,
      backgroundSize: 'cover',
      backgroundSizeCustom: '',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      overlayColor: '#4254c5',
      overlayBlendMode: 'multiply',
      blur: 25,
      overlayOpacity: 0.9,
      useAdvancedFilters: false,
      filterBrightness: 1,
      filterContrast: 1,
      filterSaturate: 1,
      filterGrayscale: 0,
    });
    // simulates automatic data removal when config fields don't have properties matching the data
    expect(background).not.toHaveProperty('fake');

    // Custom field under background should survive and be resolved
    expect(background?.test).toEqual('foo');

    // Typography values should be flattened to xlg values
    expect(typography).toMatchObject({
      fontFamily: 'roboto',
      fontColor: '#ffffff',
      useAdvancedTypography: true,
      headingWeight: 600,
      bodyWeight: 400,
      baseFontSize: '16px',
      lineHeight: 1.5,
      letterSpacing: 0,
    });

    // styles.css should be present and flattened
    expect(result.root?.props?.styles).toMatchObject({ css: '' });
  });

  test('should retain root content', () => {
    const result = sanitizePuckData({
      data: deepClone(basePageData),
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: true,
    });
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.root?.props?.content).toBeDefined();
  });

  test('should remove fields not present in the config (root props)', () => {
    const modified = deepClone(basePageData);
    // Inject an unknown remote and an unknown nested field
    (modified.root!.props as unknown as Record<string, unknown>)['__unknownRemote'] = {
      someKey: { $xlg: 'value' },
    } as unknown as Record<string, unknown>;
    (
      (modified.root!.props as unknown as Record<string, unknown>)['@hakit/default-root'] as unknown as {
        background: Record<string, unknown>;
      }
    ).background['unknownNested'] = { $xlg: 'x' } as unknown as Record<string, unknown>;

    const result = sanitizePuckData({
      data: modified,
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: true,
    });
    expect(result).not.toBeNull();
    if (!result) return;

    // Unknown remote should be trimmed away
    expect((result.root!.props as unknown as Record<string, unknown>)['__unknownRemote']).toBeUndefined();
    // Unknown nested field should be trimmed away
    const rr = (result.root!.props as unknown as Record<string, unknown>)['@hakit/default-root'] as
      | { background?: Record<string, unknown> }
      | undefined;
    expect(rr?.background?.['unknownNested']).toBeUndefined();
  });

  test('should merge defaults for missing values (root defaults)', () => {
    const modified = deepClone(basePageData);
    // Remove some values so defaults get merged back in
    delete (
      (modified.root!.props as unknown as Record<string, unknown>)['@hakit/default-root'] as unknown as {
        background: Record<string, unknown>;
        typography: Record<string, unknown>;
      }
    ).background.filterContrast;
    delete (
      (modified.root!.props as unknown as Record<string, unknown>)['@hakit/default-root'] as unknown as {
        background: Record<string, unknown>;
        typography: Record<string, unknown>;
      }
    ).typography.fontFamily;

    const result = sanitizePuckData({
      data: modified,
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: true,
    });
    expect(result).not.toBeNull();
    if (!result) return;

    const rootRemote = (result.root!.props as unknown as Record<string, unknown>)['@hakit/default-root'] as unknown as {
      background: Record<string, unknown>;
      typography: Record<string, unknown>;
    };
    // filterContrast default is 1; fontFamily default is 'roboto'
    expect(rootRemote.background['filterContrast']).toBe(1);
    expect(rootRemote.typography['fontFamily']).toBe('roboto');
  });

  test('should trim component props to config and preserve id, then merge component defaults', () => {
    const modified = deepClone(basePageData);
    modified.content = [
      {
        type: 'Navigation',
        props: {
          id: 'Navigation-123',
          // only provide a subset; sanitize should merge component defaults
          options: {
            // hideClock is an allowed field inside options
            hideClock: { $xlg: true },
            // unknown field should be removed
            unknown: { $xlg: 'nope' },
          },
          // unknown top-level prop should be removed
          unknownTopLevel: { $xlg: 'nope' },
        } as unknown,
      },
    ];

    const result = sanitizePuckData({
      data: modified,
      userConfig,
      activeBreakpoint: 'xlg',
      removeBreakpoints: true,
    });
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.content).toHaveLength(1);
    const item = result.content![0];
    // id preserved
    expect(item.props?.id).toBe('Navigation-123');
    // unknown top-level prop removed
    expect((item.props as unknown as Record<string, unknown>)['unknownTopLevel']).toBeUndefined();
    // options.unknown removed, hideClock resolved to boolean
    expect((item.props as unknown as Record<string, unknown>)['options']).toMatchObject({ hideClock: true });
    // defaults merged for missing props
    expect((item.props as unknown as Record<string, unknown>)['clockOptions']).toMatchObject({
      hideTime: false,
      useTimeEntity: true,
      timeEntity: 'sensor.time',
      timeFormat: 'hh:mm a',
      throttleTime: 1000,
      hideDate: true,
      useDateEntity: true,
      dateEntity: 'sensor.date',
      dateFormat: 'dddd, MMMM DD YYYY',
      hideIcon: true,
      icon: 'mdi:calendar',
    });
  });
});
