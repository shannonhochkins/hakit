import { describe, test, expect } from 'bun:test';
import { generateComponentBreakpointMap } from './generateComponentBreakpointMap';
import { PuckPageData } from '@typings/puck';

export const databaseData: PuckPageData = {
  root: {
    props: {},
  },
  content: [
    {
      type: 'Field Test',
      props: {
        options: {
          number: {
            $xlg: 16,
            $sm: 14,
          },
          text: {
            $xlg: '',
          },
        },
        id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
      },
    },
  ],
  zones: {},
};

describe('generateComponentBreakpointMap', () => {
  describe('basic functionality', () => {
    test('should generate a map of component instances to their field breakpoint states', () => {
      const result = generateComponentBreakpointMap(databaseData);
      expect(result).toEqual({
        'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00': {
          'options.number': true,
          'options.text': false,
        },
      });
    });

    test('should return empty map for empty PuckPageData', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({});
    });

    test('should detect multiple breakpoints in root props', () => {
      const input: PuckPageData = {
        root: {
          props: {
            backgroundColor: { $xlg: '#ffffff', $md: '#f5f5f5' }, // multiple breakpoints -> true
            padding: { $xlg: 24 }, // single breakpoint -> false
            margin: 16, // no breakpoints -> false
          },
        },
        content: [],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        root: {
          backgroundColor: true,
          padding: false,
          margin: false,
        },
      });
    });

    test('should detect multiple breakpoints in component props', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'HeadingBlock',
            props: {
              id: 'heading-1',
              title: { $xlg: 'Desktop Title', $sm: 'Mobile Title' }, // multiple -> true
              subtitle: { $xlg: 'Desktop Subtitle' }, // single -> false
              size: 'large', // no breakpoints -> false
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'heading-1': {
          title: true,
          subtitle: false,
          size: false,
        },
      });
    });

    test('should handle multiple components', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'HeadingBlock',
            props: {
              id: 'heading-1',
              title: { $xlg: 'Title 1', $md: 'Short Title 1' },
            },
          },
          {
            type: 'TextBlock',
            props: {
              id: 'text-1',
              content: { $xlg: 'Long content', $sm: 'Short content' },
              fontSize: { $xlg: '16px' },
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'heading-1': {
          title: true,
        },
        'text-1': {
          content: true,
          fontSize: false,
        },
      });
    });
  });

  describe('nested object fields', () => {
    test('should traverse nested object fields', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'ComponentWithNestedProps',
            props: {
              id: 'nested-1',
              style: {
                fontSize: { $xlg: '2rem', $md: '1.5rem' }, // multiple -> true
                color: { $xlg: '#333' }, // single -> false
                margin: {
                  top: { $xlg: 16, $sm: 8 }, // multiple -> true
                  bottom: { $xlg: 16 }, // single -> false
                },
              },
              config: {
                enabled: true, // no breakpoints -> false
                options: {
                  autoplay: { $xlg: false, $md: true }, // multiple -> true
                },
              },
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'nested-1': {
          'style.fontSize': true,
          'style.color': false,
          'style.margin.top': true,
          'style.margin.bottom': false,
          'config.enabled': false,
          'config.options.autoplay': true,
        },
      });
    });

    test('should handle deeply nested structures', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'DeepComponent',
            props: {
              id: 'deep-1',
              level1: {
                level2: {
                  level3: {
                    value: { $xlg: 'deep value', $xs: 'shallow value' },
                  },
                },
              },
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'deep-1': {
          'level1.level2.level3.value': true,
        },
      });
    });
  });

  describe('array fields', () => {
    test('should traverse array items and find breakpoint fields within them', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'ListComponent',
            props: {
              id: 'list-1',
              items: [
                {
                  title: { $xlg: 'Item 1 Desktop', $md: 'Item 1 Tablet' },
                  description: { $xlg: 'Description 1' },
                },
                {
                  title: { $xlg: 'Item 2 Desktop' },
                  count: 5,
                },
              ],
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'list-1': {
          items: false, // The array field itself has no breakpoints
          'items.title': true, // Found breakpoint fields within array items
          'items.description': false,
          'items.count': false,
        },
      });
    });

    test('should handle nested arrays with breakpoint objects', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'NestedArrayComponent',
            props: {
              id: 'nested-array-1',
              sections: [
                {
                  title: { $xlg: 'Section 1', $md: 'Sec 1' },
                  items: [{ name: { $xlg: 'Item A', $sm: 'A' } }, { name: { $xlg: 'Item B' } }],
                },
              ],
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'nested-array-1': {
          sections: false, // The array itself
          'sections.title': true, // Breakpoint field within array items
          'sections.items': false, // Nested array
          'sections.items.name': true, // At least one item has multiple breakpoints for name
        },
      });
    });
  });

  describe('zones handling', () => {
    test('should process components in zones', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [],
        zones: {
          sidebar: [
            {
              type: 'SidebarComponent',
              props: {
                id: 'sidebar-1',
                width: { $xlg: 300, $md: 250 },
                visible: { $xlg: true },
              },
            },
          ],
          footer: [
            {
              type: 'FooterComponent',
              props: {
                id: 'footer-1',
                copyright: { $xlg: '© 2025 Company', $sm: '© 2025' },
              },
            },
          ],
        },
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'sidebar-1': {
          width: true,
          visible: false,
        },
        'footer-1': {
          copyright: true,
        },
      });
    });
  });

  describe('excluded keys', () => {
    test('should exclude system keys from breakpoint detection', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'ComponentWithSystemKeys',
            props: {
              id: 'component-1', // excluded
              type: 'SomeType', // excluded
              puck: { $xlg: 'puck-value', $md: 'puck-tablet' }, // excluded
              editMode: { $xlg: true, $md: false }, // excluded
              children: { $xlg: 'child-desktop', $sm: 'child-mobile' }, // excluded
              title: { $xlg: 'Real Title', $md: 'Short Title' }, // should be included
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'component-1': {
          title: true,
        },
      });
    });
  });

  describe('edge cases', () => {
    test('should handle null and undefined values', () => {
      const input: PuckPageData = {
        root: {
          props: {
            nullValue: null,
            undefinedValue: undefined,
            validValue: { $xlg: 'test', $md: 'test2' },
          },
        },
        content: [],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        root: {
          nullValue: false,
          undefinedValue: false,
          validValue: true,
        },
      });
    });

    test('should handle empty objects and arrays', () => {
      const input: PuckPageData = {
        root: {
          props: {
            emptyObject: {},
            emptyArray: [],
            validBreakpoint: { $xlg: 'test', $sm: 'test2' },
          },
        },
        content: [],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        root: {
          emptyArray: false,
          validBreakpoint: true,
          // emptyObject is not included since it has no properties to traverse
        },
      });
    });

    test('should handle components without props', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          // @ts-expect-error: Testing component without props
          {
            type: 'ComponentWithoutProps',
            // No props property
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({});
    });

    test('should handle components without id', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'ComponentWithoutId',
            props: {
              // No id property
              title: { $xlg: 'Title', $md: 'Short Title' },
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({});
    });

    test('should handle mixed content types in arrays', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'MixedComponent',
            props: {
              id: 'mixed-1',
              mixedArray: [
                { title: { $xlg: 'Object with breakpoint', $md: 'Tablet object' } },
                'plain string',
                42,
                { staticProp: 'no breakpoints here' },
                null,
                undefined,
              ],
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'mixed-1': {
          mixedArray: false,
          'mixedArray.title': true, // Found breakpoint field in object within array
          'mixedArray.staticProp': false, // Found non-breakpoint field
        },
      });
    });

    test('should handle invalid breakpoint objects', () => {
      const input: PuckPageData = {
        root: {
          props: {
            invalidBreakpoint: { $invalid: 'should not be processed', normalProp: 'normal' },
            validBreakpoint: { $xlg: 'valid', $md: 'also valid' },
          },
        },
        content: [],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        root: {
          invalidBreakpoint: false, // Not a valid breakpoint object
          validBreakpoint: true,
        },
      });
    });
  });

  describe('complex real-world scenarios', () => {
    test('should handle complex dashboard page data structure', () => {
      const input: PuckPageData = {
        root: {
          props: {
            backgroundColor: { $xlg: '#ffffff', $md: '#f5f5f5' },
            padding: { $xlg: 24, $sm: 16 },
          },
        },
        content: [
          {
            type: 'HeadingBlock',
            props: {
              id: 'HeadingBlock-59619f25-0704-4507-9e84-787500239d3b',
              title: { $xlg: 'Dashboard Page', $md: 'Dashboard' },
              subtitle: {
                $xlg: 'This is a dashboard page',
                $md: 'Dashboard page',
              },
              style: {
                fontSize: { $xlg: '2rem', $md: '1.5rem', $sm: '1.25rem' },
                color: { $xlg: '#333333' },
              },
            },
          },
          {
            type: 'ContentBlock',
            props: {
              id: 'ContentBlock-abc123',
              content: { $xlg: 'Full content here', $sm: 'Short content' },
              items: [
                {
                  name: { $xlg: 'Item 1', $xs: 'I1' },
                  value: { $xlg: 100, $md: 75 },
                },
                {
                  name: { $xlg: 'Item 2' },
                  value: { $xlg: 200 },
                },
              ],
            },
          },
        ],
        zones: {
          sidebar: [
            {
              type: 'NavigationBlock',
              props: {
                id: 'nav-123',
                links: {
                  home: { $xlg: 'Home Page', $sm: 'Home' },
                  about: { $xlg: 'About Us', $md: 'About' },
                },
              },
            },
          ],
        },
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        root: {
          backgroundColor: true,
          padding: true,
        },
        'HeadingBlock-59619f25-0704-4507-9e84-787500239d3b': {
          title: true,
          subtitle: true,
          'style.fontSize': true,
          'style.color': false,
        },
        'ContentBlock-abc123': {
          content: true,
          items: false,
          'items.name': true, // Has multiple breakpoints in first item
          'items.value': true, // Has multiple breakpoints in first item
        },
        'nav-123': {
          'links.home': true,
          'links.about': true,
        },
      });
    });

    test('should handle deeply nested structures with mixed content', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'ComplexComponent',
            props: {
              id: 'complex-1',
              layout: {
                header: {
                  components: [
                    {
                      type: 'Logo',
                      props: {
                        id: 'logo-1',
                        src: { $xlg: '/logo-desktop.png', $md: '/logo-tablet.png' },
                        alt: { $xlg: 'Company Logo' },
                        dimensions: {
                          width: { $xlg: 200, $md: 150, $sm: 100 },
                          height: { $xlg: 60, $md: 45, $sm: 30 },
                        },
                      },
                    },
                  ],
                },
              },
              main: {
                sections: [
                  {
                    title: { $xlg: 'Main Section', $sm: 'Main' },
                    blocks: [
                      {
                        content: {
                          text: { $xlg: 'Desktop text content', $md: 'Tablet text' },
                          metadata: {
                            author: { $xlg: 'John Doe' },
                            publishDate: { $xlg: '2025-01-01', $md: '01/01/25' },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        zones: {},
      };

      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        'complex-1': {
          // The deeply nested structure reveals actual breakpoint fields
          'layout.header.components': false,
          'layout.header.components.props.src': true,
          'layout.header.components.props.alt': false,
          'layout.header.components.props.dimensions.width': true,
          'layout.header.components.props.dimensions.height': true,
          'main.sections': false,
          'main.sections.title': true,
          'main.sections.blocks': false,
          'main.sections.blocks.content.text': true,
          'main.sections.blocks.content.metadata.author': false,
          'main.sections.blocks.content.metadata.publishDate': true,
        },
      });
    });
  });

  describe('performance considerations', () => {
    test('should handle large nested structures efficiently', () => {
      const input: PuckPageData = {
        root: { props: {} },
        content: [],
        zones: {},
      };

      // Create a large structure
      for (let i = 0; i < 100; i++) {
        input.content.push({
          type: 'TestComponent',
          props: {
            id: `component-${i}`,
            title: { $xlg: `Item ${i} Desktop`, $md: `Item ${i} Tablet` },
            nested: {
              deep: {
                value: { $xlg: `Deep value ${i}`, $sm: `Shallow value ${i}` },
              },
            },
          },
        });
      }

      const result = generateComponentBreakpointMap(input);

      // Verify it processed all components
      expect(Object.keys(result)).toHaveLength(100);
      expect(result['component-0']).toEqual({
        title: true,
        'nested.deep.value': true,
      });
      expect(result['component-99']).toEqual({
        title: true,
        'nested.deep.value': true,
      });
    });

    test('should not create infinite loops with complex nested structures', () => {
      const input: PuckPageData = {
        root: {
          props: {
            title: { $xlg: 'Title' },
            nested: {
              level1: {
                level2: {
                  level3: {
                    value: { $xlg: 'deep', $md: 'shallow' },
                  },
                },
              },
            },
          },
        },
        content: [],
        zones: {},
      };

      // This should complete without hanging
      const result = generateComponentBreakpointMap(input);
      expect(result).toEqual({
        root: {
          title: false,
          'nested.level1.level2.level3.value': true,
        },
      });
    });
  });
});
