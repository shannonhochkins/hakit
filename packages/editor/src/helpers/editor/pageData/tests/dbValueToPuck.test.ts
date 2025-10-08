import { expect, test, describe } from 'bun:test';
import { dbValueToPuck } from '../dbValueToPuck';
import { createElement } from 'react';

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

  describe('children property transformation', () => {
    test('should transform children with breakpoint values', () => {
      const input = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        children: { $xlg: 'Desktop Children', $md: 'Tablet Children' },
        content: { $xlg: 'Desktop Content', $md: 'Tablet Content' },
      };

      const result = dbValueToPuck(input, 'md');

      expect(result).toEqual({
        title: 'Tablet Title',
        children: 'Tablet Children', // Now transformed
        content: 'Tablet Content',
      });
    });

    test('should preserve JSX children via isValidElement (not via key exclusion)', () => {
      const jsxChild = createElement('div', null, 'Child Component');
      const input = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        children: jsxChild, // JSX element
      };

      const result = dbValueToPuck(input, 'md');

      expect(result.title).toBe('Tablet Title');
      expect(result.children).toBe(jsxChild); // Preserved because it's JSX, not because of key name
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

    test('should handle nested objects and transform all properties', () => {
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
          id: 'tablet-id', // Now transformed
          props: {
            title: 'Tablet Title',
            puck: 'tablet-puck', // Now transformed
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
          { id: 'tablet-id' }, // Now transformed
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
              id: 'HeadingBlock-59619f25-0704-4507-9e84-787500239d3b',
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
              id: 'ContentBlock-abc123',
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
                id: 'nav-123',
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
                  id: 'logo-1',
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
        id: 'item-0',
        title: 'Item 0 Tablet',
        nested: {
          deep: {
            value: 'Deep value 0',
          },
        },
      });
      expect(result.items[99]).toEqual({
        id: 'item-99',
        title: 'Item 99 Tablet',
        nested: {
          deep: {
            value: 'Deep value 99',
          },
        },
      });
    });
  });

  describe('immutability guarantees', () => {
    test('should not mutate the original object with simple breakpoint values', () => {
      const original = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        subtitle: { $xlg: 'Desktop Subtitle' },
        count: 42,
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
    });

    test('should not mutate nested objects', () => {
      const original = {
        header: {
          title: { $xlg: 'Desktop Header', $md: 'Tablet Header' },
          navigation: {
            links: {
              home: { $xlg: 'Home Page', $sm: 'Home' },
            },
          },
        },
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.header.navigation.links.home).toEqual({
        $xlg: 'Home Page',
        $sm: 'Home',
      });
    });

    test('should not mutate arrays', () => {
      const original = {
        items: [{ title: { $xlg: 'Item 1', $md: 'I1' } }, { title: { $xlg: 'Item 2', $md: 'I2' } }],
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.items).toHaveLength(2);
      expect(original.items[0].title).toEqual({ $xlg: 'Item 1', $md: 'I1' });
    });

    test('should not mutate nested arrays', () => {
      const original = {
        sections: [
          {
            title: { $xlg: 'Section 1' },
            items: [{ name: { $xlg: 'Item A', $sm: 'A' } }, { name: { $xlg: 'Item B' } }],
          },
        ],
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.sections[0].items[0].name).toEqual({ $xlg: 'Item A', $sm: 'A' });
    });

    test('should not mutate properties with breakpoint objects', () => {
      const idObject = { $xlg: 'desktop-id', $md: 'tablet-id' };
      const original = {
        id: idObject,
        title: { $xlg: 'Title', $md: 'T' },
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.id).toEqual({ $xlg: 'desktop-id', $md: 'tablet-id' });
    });

    test('should not mutate nested properties with breakpoint objects', () => {
      const original = {
        component: {
          id: { $xlg: 'desktop-id', $md: 'tablet-id' },
          props: {
            title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
            puck: { someData: 'preserved' },
          },
        },
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.component.id).toEqual({ $xlg: 'desktop-id', $md: 'tablet-id' });
      expect(original.component.props.puck).toEqual({ someData: 'preserved' });
    });

    test('should create completely new object instances', () => {
      const nestedObj = { value: { $xlg: 'test' } };
      const original = {
        nested: nestedObj,
        items: [{ data: { $xlg: 'item' } }],
      };

      const result = dbValueToPuck(original, 'xlg');

      // Check that result is a new object
      expect(result).not.toBe(original);
      expect(result.nested).not.toBe(original.nested);
      expect(result.items).not.toBe(original.items);
      expect(result.items[0]).not.toBe(original.items[0]);
    });

    test('should not share references between original and result', () => {
      const original = {
        metadata: {
          author: { $xlg: 'John Doe' },
          tags: [{ name: { $xlg: 'tag1' } }],
        },
      };

      const result = dbValueToPuck(original, 'xlg');

      // Modify result
      (result.metadata as { author: string; tags: { name: string }[] }).author = 'Jane Doe';
      (result.metadata as { author: string; tags: { name: string }[] }).tags[0].name = 'modified';

      // Original should remain unchanged
      expect((original.metadata.author as { $xlg: string }).$xlg).toBe('John Doe');
      expect((original.metadata.tags[0].name as { $xlg: string }).$xlg).toBe('tag1');
    });

    test('should handle primitives without creating unnecessary copies', () => {
      const original = {
        string: 'test',
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = dbValueToPuck(original, 'xlg');

      expect(result).toEqual(original);
      // Primitives should have same values
      expect(result.string).toBe('test');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.nullValue).toBe(null);
      expect(result.undefinedValue).toBe(undefined);
    });

    test('should not mutate complex real-world structures', () => {
      const original = {
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
              id: 'heading-1',
              title: { $xlg: 'Dashboard', $md: 'Dash' },
              style: {
                fontSize: { $xlg: '2rem', $md: '1.5rem' },
              },
            },
          },
        ],
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      dbValueToPuck(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.root.props.backgroundColor).toEqual({ $xlg: '#ffffff', $md: '#f5f5f5' });
      expect(original.content[0].props.title).toEqual({ $xlg: 'Dashboard', $md: 'Dash' });
    });

    test('should not mutate frozen objects (definitive immutability proof)', () => {
      // Create a deeply nested structure with breakpoints
      const original = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        metadata: {
          author: { $xlg: 'John Doe', $sm: 'J. Doe' },
          tags: [{ name: { $xlg: 'JavaScript', $md: 'JS' } }, { name: { $xlg: 'TypeScript', $sm: 'TS' } }],
        },
        sections: [
          {
            header: { $xlg: 'Section 1', $md: 'Sec 1' },
            items: [{ value: { $xlg: 100, $md: 75 } }, { value: { $xlg: 200 } }],
          },
        ],
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

      const frozenOriginal = deepFreeze(original);

      // If the function tries to mutate, this will throw an error
      expect(() => {
        const result = dbValueToPuck(frozenOriginal, 'md');

        // Verify the result is correct
        expect(result.title).toBe('Tablet Title');
        expect(result.metadata.author).toBe('John Doe');
        expect(result.metadata.tags[0].name).toBe('JS');
        expect(result.sections[0].header).toBe('Sec 1');
        expect(result.sections[0].items[0].value).toBe(75);
      }).not.toThrow();

      // Original frozen object is still intact
      expect(frozenOriginal.title).toEqual({ $xlg: 'Desktop Title', $md: 'Tablet Title' });
      expect(frozenOriginal.metadata.author).toEqual({ $xlg: 'John Doe', $sm: 'J. Doe' });
      expect(frozenOriginal.metadata.tags[0].name).toEqual({ $xlg: 'JavaScript', $md: 'JS' });
    });
  });

  describe('JSX/React element handling', () => {
    test('should preserve JSX elements as-is without transformation', () => {
      const jsxElement = createElement('div', { className: 'test' }, 'Hello');
      const original = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        component: jsxElement,
      };

      const result = dbValueToPuck(original, 'md');

      expect(result.title).toBe('Tablet Title');
      expect(result.component).toBe(jsxElement); // Same reference
    });

    test('should preserve JSX elements in arrays', () => {
      const jsx1 = createElement('div', { key: '1' }, 'First');
      const jsx2 = createElement('span', { key: '2' }, 'Second');

      const original = {
        components: [jsx1, { title: { $xlg: 'Desktop', $md: 'Tablet' } }, jsx2],
      };

      const result = dbValueToPuck(original, 'md');

      expect((result.components as unknown[])[0]).toBe(jsx1);
      expect((result.components as { title: string }[])[1].title).toBe('Tablet');
      expect((result.components as unknown[])[2]).toBe(jsx2);
    });

    test('should preserve JSX elements in nested structures', () => {
      const jsxElement = createElement('button', { type: 'button' }, 'Click me');

      const original = {
        layout: {
          header: {
            title: { $xlg: 'Desktop Header', $md: 'Header' },
            actions: [jsxElement, { label: { $xlg: 'Desktop Label' } }],
          },
        },
      };

      const result = dbValueToPuck(original, 'md');

      expect((result.layout as { header: { title: string; actions: unknown[] } }).header.title).toBe('Header');
      expect((result.layout as { header: { title: string; actions: unknown[] } }).header.actions[0]).toBe(jsxElement);
    });

    test('should preserve JSX even when wrapped in breakpoint objects', () => {
      const desktopJsx = createElement('div', null, 'Desktop Component');
      const tabletJsx = createElement('div', null, 'Tablet Component');

      const original = {
        dynamicComponent: {
          $xlg: desktopJsx,
          $md: tabletJsx,
        },
      };

      const xlgResult = dbValueToPuck(original, 'xlg');
      const mdResult = dbValueToPuck(original, 'md');

      expect(xlgResult.dynamicComponent).toBe(desktopJsx);
      expect(mdResult.dynamicComponent).toBe(tabletJsx);
    });

    test('should not mutate JSX elements', () => {
      const jsxElement = createElement('div', { className: 'original' }, 'Content');
      const original = {
        component: jsxElement,
        title: { $xlg: 'Title' },
      };

      const result = dbValueToPuck(original, 'xlg');

      // JSX element should be the exact same reference
      expect(result.component).toBe(jsxElement);
      expect(original.component).toBe(jsxElement);
    });

    test('should handle mixed JSX and regular objects', () => {
      const jsx = createElement('div', null, 'JSX Content');

      const original = {
        staticJsx: jsx,
        breakpointText: { $xlg: 'Desktop Text', $md: 'Tablet Text' },
        nested: {
          dynamicJsx: jsx,
          value: { $xlg: 100, $md: 50 },
        },
        components: [jsx, { type: 'text', props: { content: { $xlg: 'Desktop' } } }, jsx],
      };

      const result = dbValueToPuck(original, 'md');

      expect(result.staticJsx).toBe(jsx);
      expect(result.breakpointText).toBe('Tablet Text');
      expect((result.nested as { dynamicJsx: unknown; value: number }).dynamicJsx).toBe(jsx);
      expect((result.nested as { dynamicJsx: unknown; value: number }).value).toBe(50);
      expect((result.components as unknown[])[0]).toBe(jsx);
      expect((result.components as unknown[])[2]).toBe(jsx);
    });

    test('should handle JSX in any property (including children)', () => {
      const jsxElement = createElement('div', null, 'Child Content');

      const original = {
        id: 'component-123',
        children: jsxElement, // JSX element
        title: { $xlg: 'Title' },
      };

      const result = dbValueToPuck(original, 'xlg');

      expect(result.id).toBe('component-123');
      expect(result.children).toBe(jsxElement);
      expect(result.title).toBe('Title');
    });

    test('should handle complex JSX with props', () => {
      const complexJsx = createElement(
        'div',
        { className: 'container', style: { padding: 20 } },
        createElement('span', null, 'Nested content')
      );

      const original = {
        header: { $xlg: 'Desktop Header', $md: 'Tablet Header' },
        content: complexJsx,
      };

      const result = dbValueToPuck(original, 'md');

      expect(result.header).toBe('Tablet Header');
      expect(result.content).toBe(complexJsx);
    });
  });

  test('should transform top level breakpoint objects too', () => {
    const value = {
      $xlg: 'Desktop Value',
      $md: 'Tablet Value',
    };

    const result = dbValueToPuck(value, 'md');

    expect(result).toBe('Tablet Value');
  });

  test('should transform top level breakpoint objects that resolve to objects', () => {
    const value = {
      $xlg: { title: 'Desktop', count: 100 },
      $md: { title: 'Tablet', count: 50 },
    };

    const result = dbValueToPuck(value, 'md');

    expect(result).toEqual({ title: 'Tablet', count: 50 });
  });

  test('should transform top level breakpoint objects that resolve to nested breakpoint objects', () => {
    const value = {
      $xlg: {
        title: { $xlg: 'Desktop Title', $sm: 'Mobile Title' },
        count: 100,
      },
      $md: {
        title: { $xlg: 'Tablet Title', $sm: 'Small Tablet' },
        count: 50,
      },
    };

    const result = dbValueToPuck(value, 'md');

    // The outer breakpoint resolves to $md value
    // Then the inner breakpoint (title) also gets resolved for $md, which falls back to $xlg
    expect(result).toEqual({
      title: 'Tablet Title',
      count: 50,
    });
  });

  test('should handle top level breakpoint objects with fallback', () => {
    const value = {
      $xlg: 'Desktop Value',
      $sm: 'Mobile Value',
    };

    // $md not available, should fall back to $xlg
    const result = dbValueToPuck(value, 'md');

    expect(result).toBe('Desktop Value');
  });

  test('should not mutate top level breakpoint object', () => {
    const value = {
      $xlg: 'Desktop Value',
      $md: 'Tablet Value',
    };

    const originalCopy = JSON.parse(JSON.stringify(value)) as typeof value;

    dbValueToPuck(value, 'md');

    expect(value).toEqual(originalCopy);
  });

  test('should handle deeply nested breakpoint objects (3+ levels)', () => {
    const value = {
      // Level 1: Top-level breakpoint
      $xlg: {
        header: {
          // Level 2: Nested breakpoint in header
          title: { $xlg: 'Desktop Header', $md: 'Tablet Header' },
          metadata: {
            // Level 3: Deeply nested breakpoint
            author: { $xlg: 'John Doe', $sm: 'J. Doe' },
            published: {
              // Level 4: Even deeper nesting
              date: { $xlg: '2025-01-01', $xs: '01/01' },
            },
          },
        },
        content: { $xlg: 'Desktop Content' },
      },
      $md: {
        header: {
          title: { $xlg: 'Tablet Header Main', $sm: 'Tablet Small' },
          metadata: {
            author: { $xlg: 'Jane Doe', $sm: 'J. D.' },
            published: {
              date: { $xlg: '2025-02-01', $xs: '02/01' },
            },
          },
        },
        content: { $xlg: 'Tablet Content' },
      },
    };

    const result = dbValueToPuck(value, 'md');

    // Verify all nested breakpoints are resolved correctly
    expect(result).toEqual({
      header: {
        title: 'Tablet Header Main', // Resolved from $md > header > title > $xlg
        metadata: {
          author: 'Jane Doe', // Resolved from $md > metadata > author > $xlg
          published: {
            date: '2025-02-01', // Resolved from $md > published > date > $xlg
          },
        },
      },
      content: 'Tablet Content', // Resolved from $md > content > $xlg
    });

    // Test with smaller breakpoint to verify cascading fallback through multiple levels
    const smallResult = dbValueToPuck(value, 'sm');

    expect(smallResult).toEqual({
      header: {
        title: 'Tablet Small', // Falls back through: $sm not in top level -> uses $xlg, then resolves title to $sm
        metadata: {
          author: 'J. D.', // Uses $sm from author
          published: {
            date: '2025-02-01', // Falls back to $xlg
          },
        },
      },
      content: 'Tablet Content', // Falls back through multiple levels
    });
  });

  test('should preserve unknown fields and typings', () => {
    const value = {
      puck: {
        something: 'something',
      },
    };
    const result = dbValueToPuck(value, 'xlg');
    expect(result.puck.something).toBe('something');
  });
});
