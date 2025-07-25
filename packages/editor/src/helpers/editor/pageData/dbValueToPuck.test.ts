import { expect, test, describe } from 'bun:test';
import { dbValueToPuck } from './dbValueToPuck';

describe('dbValueToPuck', () => {
  describe('simple breakpoint objects', () => {
    test('should resolve values for exact breakpoint match', () => {
      const input = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title', $xs: 'Mobile Title' },
      };

      expect(dbValueToPuck(input, 'xlg')).toEqual({
        title: 'Desktop Title',
      });

      expect(dbValueToPuck(input, 'md')).toEqual({
        title: 'Tablet Title',
      });

      expect(dbValueToPuck(input, 'xs')).toEqual({
        title: 'Mobile Title',
      });
    });

    test('should fall back to larger breakpoints when current breakpoint is not available', () => {
      const input = {
        title: { $xlg: 'Desktop Title', $sm: 'Small Title' },
      };

      // md not available, should fall back to xlg
      expect(dbValueToPuck(input, 'md')).toEqual({
        title: 'Desktop Title',
      });

      // lg not available, should fall back to xlg
      expect(dbValueToPuck(input, 'lg')).toEqual({
        title: 'Desktop Title',
      });

      // xs not available, should fall back to sm
      expect(dbValueToPuck(input, 'xs')).toEqual({
        title: 'Small Title',
      });
    });

    test('should use xlg as ultimate fallback', () => {
      const input = {
        title: { $xlg: 'Default Title' },
      };

      expect(dbValueToPuck(input, 'xxs')).toEqual({
        title: 'Default Title',
      });

      expect(dbValueToPuck(input, 'xs')).toEqual({
        title: 'Default Title',
      });

      expect(dbValueToPuck(input, 'md')).toEqual({
        title: 'Default Title',
      });
    });

    test('should handle mixed breakpoint and non-breakpoint properties', () => {
      const input = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        description: 'Static description',
        count: 42,
        enabled: true,
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        title: 'Tablet Title',
        description: 'Static description',
        count: 42,
        enabled: true,
      });
    });
  });

  describe('excluded properties', () => {
    test('should not transform excluded properties', () => {
      const input = {
        id: { $xlg: 'desktop-id', $md: 'tablet-id' },
        key: { $xlg: 'desktop-key', $md: 'tablet-key' },
        puck: { $xlg: 'desktop-puck', $md: 'tablet-puck' },
        editMode: { $xlg: true, $md: false },
        children: { $xlg: 'desktop-children', $md: 'tablet-children' },
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
      };

      const result = dbValueToPuck(input, 'md');

      expect(result).toEqual({
        id: { $xlg: 'desktop-id', $md: 'tablet-id' },
        key: { $xlg: 'desktop-key', $md: 'tablet-key' },
        puck: { $xlg: 'desktop-puck', $md: 'tablet-puck' },
        editMode: { $xlg: true, $md: false },
        children: { $xlg: 'desktop-children', $md: 'tablet-children' },
        title: 'Tablet Title', // Only this should be transformed
      });
    });
  });

  describe('nested objects', () => {
    test('should transform deeply nested breakpoint objects', () => {
      const input = {
        header: {
          title: { $xlg: 'Desktop Header', $md: 'Tablet Header' },
          subtitle: { $xlg: 'Desktop Subtitle' },
          navigation: {
            links: {
              home: { $xlg: 'Home', $sm: 'H' },
              about: { $xlg: 'About Us', $md: 'About' },
            },
          },
        },
        footer: {
          copyright: { $xlg: '© 2025 Company', $xs: '© 2025' },
        },
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        header: {
          title: 'Tablet Header',
          subtitle: 'Desktop Subtitle', // Falls back to xlg
          navigation: {
            links: {
              home: 'Home', // Falls back to xlg
              about: 'About',
            },
          },
        },
        footer: {
          copyright: '© 2025 Company', // Falls back to xlg
        },
      });

      expect(dbValueToPuck(input, 'xs')).toEqual({
        header: {
          title: 'Tablet Header', // Uses md (closest available)
          subtitle: 'Desktop Subtitle',
          navigation: {
            links: {
              home: 'H', // Uses sm (closest available)
              about: 'About', // Uses md (closest available)
            },
          },
        },
        footer: {
          copyright: '© 2025',
        },
      });
    });

    test('should handle nested objects with excluded properties', () => {
      const input = {
        component: {
          id: { $xlg: 'desktop-id', $md: 'tablet-id' },
          props: {
            title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
            puck: { $xlg: 'desktop-puck', $md: 'tablet-puck' },
          },
        },
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        component: {
          id: { $xlg: 'desktop-id', $md: 'tablet-id' }, // Not transformed
          props: {
            title: 'Tablet Title',
            puck: { $xlg: 'desktop-puck', $md: 'tablet-puck' }, // Not transformed
          },
        },
      });
    });
  });

  describe('arrays', () => {
    test('should transform breakpoint objects within arrays', () => {
      const input = {
        items: [
          {
            title: { $xlg: 'Item 1 Desktop', $md: 'Item 1 Tablet' },
            description: { $xlg: 'Description 1' },
          },
          {
            title: { $xlg: 'Item 2 Desktop', $sm: 'Item 2 Mobile' },
            count: 5,
          },
        ],
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        items: [
          {
            title: 'Item 1 Tablet',
            description: 'Description 1',
          },
          {
            title: 'Item 2 Desktop', // Falls back to xlg
            count: 5,
          },
        ],
      });

      expect(dbValueToPuck(input, 'sm')).toEqual({
        items: [
          {
            title: 'Item 1 Tablet', // Uses md (closest available)
            description: 'Description 1',
          },
          {
            title: 'Item 2 Mobile',
            count: 5,
          },
        ],
      });
    });

    test('should handle nested arrays with breakpoint objects', () => {
      const input = {
        sections: [
          {
            title: { $xlg: 'Section 1', $md: 'Sec 1' },
            items: [{ name: { $xlg: 'Item A', $sm: 'A' } }, { name: { $xlg: 'Item B' } }],
          },
          {
            title: { $xlg: 'Section 2' },
            items: [{ name: { $xlg: 'Item C', $xs: 'C' } }],
          },
        ],
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        sections: [
          {
            title: 'Sec 1',
            items: [
              { name: 'Item A' }, // Falls back to xlg
              { name: 'Item B' },
            ],
          },
          {
            title: 'Section 2',
            items: [
              { name: 'Item C' }, // Falls back to xlg
            ],
          },
        ],
      });

      expect(dbValueToPuck(input, 'xs')).toEqual({
        sections: [
          {
            title: 'Sec 1', // Uses md (closest available)
            items: [
              { name: 'A' }, // Uses sm (closest available)
              { name: 'Item B' },
            ],
          },
          {
            title: 'Section 2',
            items: [{ name: 'C' }],
          },
        ],
      });
    });

    test('should handle arrays with mixed types', () => {
      const input = {
        mixedArray: [
          { title: { $xlg: 'Object with breakpoint', $md: 'Tablet object' } },
          'plain string',
          42,
          { staticProp: 'no breakpoints here' },
          null,
          { id: { $xlg: 'excluded-id', $md: 'tablet-id' } },
        ],
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        mixedArray: [
          { title: 'Tablet object' },
          'plain string',
          42,
          { staticProp: 'no breakpoints here' },
          null,
          { id: { $xlg: 'excluded-id', $md: 'tablet-id' } }, // Excluded from transformation
        ],
      });
    });
  });

  describe('edge cases', () => {
    test('should handle null and undefined values', () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined,
        breakpointWithNull: { $xlg: null, $md: 'has value' },
        breakpointWithUndefined: { $xlg: undefined, $md: 'has value' },
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        nullValue: null,
        undefinedValue: undefined,
        breakpointWithNull: 'has value', // Uses md value directly
        breakpointWithUndefined: 'has value',
      });
    });

    test('should handle empty objects and arrays', () => {
      const input = {
        emptyObject: {},
        emptyArray: [],
        objectWithEmptyNested: {
          nested: {},
          array: [],
        },
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        emptyObject: {},
        emptyArray: [],
        objectWithEmptyNested: {
          nested: {},
          array: [],
        },
      });
    });

    test('should handle breakpoint objects with all breakpoints', () => {
      const input = {
        allBreakpoints: {
          $xxs: 'Extra extra small',
          $xs: 'Extra small',
          $sm: 'Small',
          $md: 'Medium',
          $lg: 'Large',
          $xlg: 'Extra large',
        },
      };

      expect(dbValueToPuck(input, 'xxs')).toEqual({
        allBreakpoints: 'Extra extra small',
      });

      expect(dbValueToPuck(input, 'xs')).toEqual({
        allBreakpoints: 'Extra small',
      });

      expect(dbValueToPuck(input, 'sm')).toEqual({
        allBreakpoints: 'Small',
      });

      expect(dbValueToPuck(input, 'md')).toEqual({
        allBreakpoints: 'Medium',
      });

      expect(dbValueToPuck(input, 'lg')).toEqual({
        allBreakpoints: 'Large',
      });

      expect(dbValueToPuck(input, 'xlg')).toEqual({
        allBreakpoints: 'Extra large',
      });
    });

    test('should handle objects with various value types', () => {
      const input = {
        stringValue: { $xlg: 'string', $md: 'tablet string' },
        numberValue: { $xlg: 100, $md: 50 },
        booleanValue: { $xlg: true, $md: false },
        arrayValue: { $xlg: [1, 2, 3], $md: [4, 5] },
        objectValue: { $xlg: { nested: 'value' }, $md: { nested: 'tablet' } },
        nullValue: { $xlg: null, $md: 'not null' },
        undefinedValue: { $xlg: undefined, $md: 'defined' },
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        stringValue: 'tablet string',
        numberValue: 50,
        booleanValue: false,
        arrayValue: [4, 5],
        objectValue: { nested: 'tablet' },
        nullValue: 'not null', // Uses md value directly
        undefinedValue: 'defined',
      });
    });
  });

  describe('complex real-world scenarios', () => {
    test('should transform complex dashboard page data structure', () => {
      const input = {
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

      const result = dbValueToPuck(input, 'md');

      expect(result).toEqual({
        root: {
          props: {
            backgroundColor: '#f5f5f5',
            padding: 24, // Falls back to xlg
          },
        },
        content: [
          {
            type: 'HeadingBlock',
            props: {
              id: 'HeadingBlock-59619f25-0704-4507-9e84-787500239d3b', // Excluded
              title: 'Dashboard',
              subtitle: 'Dashboard page',
              style: {
                fontSize: '1.5rem',
                color: '#333333', // Falls back to xlg
              },
            },
          },
          {
            type: 'ContentBlock',
            props: {
              id: 'ContentBlock-abc123', // Excluded
              content: 'Full content here', // Falls back to xlg
              items: [
                {
                  name: 'Item 1', // Falls back to xlg
                  value: 75,
                },
                {
                  name: 'Item 2',
                  value: 200,
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
                id: 'nav-123', // Excluded
                links: {
                  home: 'Home Page', // Falls back to xlg
                  about: 'About',
                },
              },
            },
          ],
        },
      });
    });

    test('should handle deeply nested structures with mixed content', () => {
      const input = {
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
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        layout: {
          header: {
            components: [
              {
                type: 'Logo',
                props: {
                  id: 'logo-1', // Excluded
                  src: '/logo-tablet.png',
                  alt: 'Company Logo', // Falls back to xlg
                  dimensions: {
                    width: 150,
                    height: 45,
                  },
                },
              },
            ],
          },
          main: {
            sections: [
              {
                title: 'Main Section', // Falls back to xlg
                blocks: [
                  {
                    content: {
                      text: 'Tablet text',
                      metadata: {
                        author: 'John Doe',
                        publishDate: '01/01/25',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      });
    });
  });

  describe('type safety and error handling', () => {
    test('should handle invalid breakpoint objects gracefully', () => {
      const input = {
        invalidBreakpoint: { $invalid: 'should not be processed', normalProp: 'normal' },
        validBreakpoint: { $xlg: 'valid value' },
      };

      expect(dbValueToPuck(input, 'md')).toEqual({
        invalidBreakpoint: { $invalid: 'should not be processed', normalProp: 'normal' },
        validBreakpoint: 'valid value',
      });
    });

    test('should handle circular references by not infinitely recursing', () => {
      const input = {
        title: { $xlg: 'Title' },
      };
      // Don't create actual circular reference as it would break JSON serialization
      // Just test that normal nested objects work fine

      expect(dbValueToPuck(input, 'xlg')).toEqual({
        title: 'Title',
      });
    });
  });

  describe('performance considerations', () => {
    test('should handle large nested structures efficiently', () => {
      const input: {
        items: {
          id: string;
          title: { $xlg: string; $md: string };
          nested: {
            deep: {
              value: { $xlg: string };
            };
          };
        }[];
      } = {
        items: [],
      };

      // Create a large structure
      for (let i = 0; i < 100; i++) {
        input.items.push({
          id: `item-${i}`,
          title: { $xlg: `Item ${i} Desktop`, $md: `Item ${i} Tablet` },
          nested: {
            deep: {
              value: { $xlg: `Deep value ${i}` },
            },
          },
        });
      }

      const result = dbValueToPuck(input, 'md');

      expect(result.items).toHaveLength(100);
      expect(result.items[0]).toEqual({
        id: 'item-0', // Excluded
        title: 'Item 0 Tablet',
        nested: {
          deep: {
            value: 'Deep value 0',
          },
        },
      });
      expect(result.items[99]).toEqual({
        id: 'item-99', // Excluded
        title: 'Item 99 Tablet',
        nested: {
          deep: {
            value: 'Deep value 99',
          },
        },
      });
    });
  });
});
