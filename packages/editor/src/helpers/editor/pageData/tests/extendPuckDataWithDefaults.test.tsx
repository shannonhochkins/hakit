import { describe, test, expect } from 'bun:test';
import { extendPuckDataWithDefaults } from '../extendPuckDataWithDefaults';
import { CustomPuckConfig, PuckPageData } from '@typings/puck';
import { DefaultComponentProps, ComponentData } from '@measured/puck';

describe('extendPuckDataWithDefaults', () => {
  test('should extend missing typography object with defaults', () => {
    const mockData: PuckPageData = {
      zones: {},
      content: [],
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
              blur: 22,
            },
            // Missing typography object
          },
          $styles: {
            css: '',
          },
        },
      },
    };

    const mockUserConfig: CustomPuckConfig<DefaultComponentProps> = {
      components: {},
      root: {
        defaultProps: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
              blur: 25,
              overlayOpacity: 0.9,
              useAdvancedFilters: false,
              filterBrightness: 1,
              filterContrast: 1,
              filterSaturate: 1,
              filterGrayscale: 0,
            },
            typography: {
              fontFamily: 'roboto',
              fontColor: '#ffffff',
              useAdvancedTypography: false,
              headingWeight: 600,
              bodyWeight: 400,
              baseFontSize: '16px',
              lineHeight: 1.5,
              letterSpacing: 0,
            },
          },
        },
      },
    };

    const result = extendPuckDataWithDefaults(mockData, mockUserConfig);

    expect(result).toBeDefined();
    expect(result?.root?.props?.['@hakit/default-root']).toHaveProperty('typography');

    const typography = result?.root?.props?.['@hakit/default-root'].typography;
    expect(typography).toHaveProperty('fontFamily', 'roboto');
    expect(typography).toHaveProperty('fontColor', '#ffffff');
    expect(typography).toHaveProperty('useAdvancedTypography', false);
    expect(typography).toHaveProperty('headingWeight', 600);
    expect(typography).toHaveProperty('bodyWeight', 400);
    expect(typography).toHaveProperty('baseFontSize', '16px');
    expect(typography).toHaveProperty('lineHeight', 1.5);
    expect(typography).toHaveProperty('letterSpacing', 0);
  });

  test('should extend missing background properties with defaults', () => {
    const mockData: PuckPageData = {
      zones: {},
      content: [],
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#ff0000', // Different from default
            },
            // Missing typography object entirely
          },
        },
      },
    };

    const mockUserConfig: CustomPuckConfig<DefaultComponentProps> = {
      components: {},
      root: {
        defaultProps: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
              blur: 25,
              overlayOpacity: 0.9,
              useAdvancedFilters: false,
              filterBrightness: 1,
              filterContrast: 1,
              filterSaturate: 1,
              filterGrayscale: 0,
            },
            typography: {
              fontFamily: 'roboto',
              fontColor: '#ffffff',
              useAdvancedTypography: false,
              headingWeight: 600,
              bodyWeight: 400,
              baseFontSize: '16px',
              lineHeight: 1.5,
              letterSpacing: 0,
            },
          },
        },
      },
    };

    const result = extendPuckDataWithDefaults(mockData, mockUserConfig);

    expect(result).toBeDefined();

    const background = result?.root?.props?.['@hakit/default-root'].background;
    // Should preserve existing values
    expect(background).toHaveProperty('useBackgroundImage', true);
    expect(background).toHaveProperty('overlayColor', '#ff0000'); // Preserved existing value

    // Should add missing properties with defaults
    expect(background).toHaveProperty('blur', 25);
    expect(background).toHaveProperty('overlayOpacity', 0.9);
    expect(background).toHaveProperty('useAdvancedFilters', false);
    expect(background).toHaveProperty('filterBrightness', 1);
    expect(background).toHaveProperty('filterContrast', 1);
    expect(background).toHaveProperty('filterSaturate', 1);
    expect(background).toHaveProperty('filterGrayscale', 0);

    // Should add missing typography object
    expect(result?.root?.props?.['@hakit/default-root']).toHaveProperty('typography');
  });

  test('should handle missing remote entirely', () => {
    const mockData: PuckPageData = {
      zones: {},
      content: [],
      root: {
        props: {
          // Missing '@hakit/default-root' entirely
          styles: {
            css: '',
          },
        },
      },
    };

    const mockUserConfig: CustomPuckConfig<DefaultComponentProps> = {
      components: {},
      root: {
        defaultProps: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
              blur: 25,
            },
            typography: {
              fontFamily: 'roboto',
              fontColor: '#ffffff',
            },
          },
        },
      },
    };

    const result = extendPuckDataWithDefaults(mockData, mockUserConfig);

    expect(result).toBeDefined();
    expect(result?.root?.props?.['@hakit/default-root']).toBeDefined();

    const defaultRoot = result?.root?.props?.['@hakit/default-root'];
    expect(defaultRoot).toHaveProperty('background');
    expect(defaultRoot).toHaveProperty('typography');

    expect(defaultRoot.background).toHaveProperty('useBackgroundImage', true);
    expect(defaultRoot.background).toHaveProperty('overlayColor', '#4254c5');
    expect(defaultRoot.background).toHaveProperty('blur', 25);

    expect(defaultRoot.typography).toHaveProperty('fontFamily', 'roboto');
    expect(defaultRoot.typography).toHaveProperty('fontColor', '#ffffff');
  });

  test('should return data unchanged if no defaultProps in userConfig', () => {
    const mockData: PuckPageData = {
      zones: {},
      content: [],
      root: {
        props: {
          content: [],
        },
        content: [],
      },
    };

    const mockUserConfig: CustomPuckConfig<DefaultComponentProps> = {
      components: {},
      root: {
        defaultProps: {},
      },
    };

    const result = extendPuckDataWithDefaults(mockData, mockUserConfig);
    expect(result).toEqual(mockData);
  });

  test('should not mutate frozen input data (definitive immutability proof)', () => {
    // Create a complex nested structure
    const mockData: PuckPageData = {
      zones: {
        main: [
          {
            type: 'TestComponent',
            props: {
              id: 'test-1',
              title: 'Zone Component',
            },
          },
        ],
      },
      content: [
        {
          type: 'TestComponent',
          props: {
            id: 'test-2',
            title: 'Content Component',
            nested: {
              value: 'deep',
            },
          },
        },
      ],
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#ff0000',
            },
          },
          styles: {
            css: 'body { color: red; }',
          },
        },
      },
    };

    const mockUserConfig: CustomPuckConfig<{
      TestComponent: {
        title: string;
        newProp: string;
      };
    }> = {
      components: {
        TestComponent: {
          fields: {
            title: {
              type: 'text',
              label: 'Title',
              default: '',
            },
            newProp: {
              type: 'text',
              label: 'New Prop',
              default: '',
            },
          },
          render() {
            return <></>;
          },
          label: 'TestComponent',
          defaultProps: {
            title: 'Default Title',
            newProp: 'This is new',
          },
        },
      },
      root: {
        defaultProps: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
              blur: 25,
              overlayOpacity: 0.9,
            },
            typography: {
              fontFamily: 'roboto',
              fontColor: '#ffffff',
            },
          },
        },
      },
    };

    // Deep freeze the entire object - any mutation attempt will throw an error
    const deepFreeze = <T extends object>(obj: T): T => {
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach(prop => {
        const val = obj[prop as keyof object];
        if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
          deepFreeze(val);
        }
      });
      return obj;
    };

    const frozenData = deepFreeze(mockData);

    // If the function tries to mutate, this will throw an error
    expect(() => {
      const result = extendPuckDataWithDefaults(frozenData, mockUserConfig);

      // Verify the result is correct
      expect(result).toBeDefined();

      // Check that defaults were merged
      const root = result?.root?.props?.['@hakit/default-root'];
      expect(root?.background?.overlayColor).toBe('#ff0000'); // Existing value preserved
      expect(root?.background?.blur).toBe(25); // Default added
      expect(root?.typography?.fontFamily).toBe('roboto'); // Default added

      // Check that component defaults were merged
      expect(result.content?.[0]?.props?.title).toBe('Content Component'); // Existing preserved
      expect(result.content?.[0]?.props.newProp).toBe('This is new'); // Default added
    }).not.toThrow();

    // Original frozen data is still intact
    expect(frozenData.root.props?.['@hakit/default-root'].background.overlayColor).toBe('#ff0000');
    expect(frozenData.root.props?.['@hakit/default-root'].background).not.toHaveProperty('blur');
    expect(frozenData.content[0].props.title).toBe('Content Component');
    expect(frozenData.content[0].props).not.toHaveProperty('newProp');
  });

  test('should extend defaults for components under root.props.content', () => {
    const mockData: PuckPageData = {
      zones: {},
      content: [],
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
            },
          },
          content: [
            {
              type: 'Navigation',
              props: {
                id: 'nav-1',
                styles: { css: 'background: red;' },
                clockOptions: { hideTime: true },
                options: { pages: [] },
              },
            },
            {
              type: 'Navigation',
              props: {
                id: 'nav-2',
              },
            },
          ],
        },
      },
    };

    const mockUserConfig: CustomPuckConfig<DefaultComponentProps> = {
      components: {
        Navigation: {
          fields: {},
          label: 'Navigation',
          render() {
            return <></>;
          },
          defaultProps: {
            options: {
              pages: [],
              hideClock: false,
            },
            clockOptions: {
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
              icon: 'Info',
            },
            interactions: {
              tap: { type: 'none' },
              hold: { type: 'none' },
              doubleTap: { type: 'none' },
            },
            styles: { css: '' },
          },
        },
      },
      root: {
        defaultProps: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: true,
              overlayColor: '#4254c5',
            },
          },
        },
      },
    };

    const result = extendPuckDataWithDefaults(mockData, mockUserConfig);

    const content = result.root?.props?.content as unknown as ComponentData[];

    expect(Array.isArray(content)).toBe(true);
    expect(content.length).toBe(2);

    const nav1 = content[0];
    const nav2 = content[1];

    // nav1 preserves explicit values and gets missing defaults
    expect(nav1.props.styles.css).toBe('background: red;'); // preserved
    expect(nav1.props.clockOptions.hideTime).toBe(true); // preserved
    expect(nav1.props.interactions.tap.type).toBe('none'); // default added
    expect(nav1.props.options.hideClock).toBe(false); // default added

    // nav2 receives defaults entirely
    expect(nav2.props.styles.css).toBe('');
    expect(nav2.props.clockOptions.hideTime).toBe(false);
    expect(nav2.props.interactions.tap.type).toBe('none');
    expect(nav2.props.options.hideClock).toBe(false);
  });

  test('should recurse into props.content for components inside root.props.content', () => {
    const mockData: PuckPageData = {
      zones: {},
      content: [],
      root: {
        props: {
          content: [
            {
              type: 'Container',
              props: {
                id: 'container-1',
                content: [
                  {
                    type: 'Navigation',
                    props: {},
                  },
                ],
              },
            },
          ],
        },
      },
    };

    const mockUserConfig: CustomPuckConfig<DefaultComponentProps> = {
      components: {
        Container: {
          fields: {},
          label: 'Container',
          render() {
            return <></>;
          },
          defaultProps: {},
        },
        Navigation: {
          fields: {},
          label: 'Navigation',
          render() {
            return <></>;
          },
          defaultProps: {
            interactions: {
              tap: { type: 'none' },
              hold: { type: 'none' },
              doubleTap: { type: 'none' },
            },
            styles: { css: '' },
          },
        },
      },
      root: {
        defaultProps: {},
      },
    };

    const result = extendPuckDataWithDefaults(mockData, mockUserConfig);

    const containerArray = result.root?.props?.content as unknown as ComponentData[];
    const container = containerArray[0];
    const childArray = (container.props as unknown as { content: ComponentData[] }).content;
    const child = childArray[0];

    // Child inside root.props.content receives defaults
    expect(child.type).toBe('Navigation');
    expect(child.props.interactions.tap.type).toBe('none');
    expect(child.props.styles.css).toBe('');
  });
});
