import { describe, test, expect } from 'bun:test';
import { removeBreakpointData } from '../removeBreakpointData';
import { createElement } from 'react';

describe('removeBreakpointData', () => {
  describe('simple breakpoint objects', () => {
    test('should remove top level object with breakpoint data', () => {
      const input = { $xlg: 'Desktop', $md: 'Tablet', $sm: 'Mobile' };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({ $xlg: 'Desktop', $sm: 'Mobile' });
    });

    test('should remove specified breakpoint key from simple object', () => {
      const input = {
        title: { $xlg: 'Desktop', $md: 'Tablet', $sm: 'Mobile' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        title: { $xlg: 'Desktop', $sm: 'Mobile' },
      });
    });

    test('should remove all occurrences of the breakpoint key', () => {
      const input = {
        title: { $xlg: 'Desktop Title', $md: 'Tablet Title' },
        subtitle: { $xlg: 'Desktop Subtitle', $md: 'Tablet Subtitle', $sm: 'Mobile' },
        description: { $xlg: 'Description', $md: 'Short Desc' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        title: { $xlg: 'Desktop Title' },
        subtitle: { $xlg: 'Desktop Subtitle', $sm: 'Mobile' },
        description: { $xlg: 'Description' },
      });
    });

    test('should handle object with only the breakpoint to remove', () => {
      const input = {
        value: { $md: 'Only Medium' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        value: {},
      });
    });

    test('should preserve object when breakpoint does not exist', () => {
      const input = {
        title: { $xlg: 'Desktop', $sm: 'Mobile' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        title: { $xlg: 'Desktop', $sm: 'Mobile' },
      });
    });

    test('should handle all breakpoint types', () => {
      const input = {
        value: { $xxs: 1, $xs: 2, $sm: 3, $md: 4, $lg: 5, $xlg: 6 },
      };

      const resultXs = removeBreakpointData(input, 'xs');
      expect(resultXs).toEqual({
        value: { $xxs: 1, $sm: 3, $md: 4, $lg: 5, $xlg: 6 },
      });

      const resultXlg = removeBreakpointData(input, 'xlg');
      expect(resultXlg).toEqual({
        value: { $xxs: 1, $xs: 2, $sm: 3, $md: 4, $lg: 5 },
      });
    });
  });

  describe('nested objects', () => {
    test('should remove breakpoint from deeply nested objects', () => {
      const input = {
        header: {
          title: { $xlg: 'Desktop Header', $md: 'Tablet Header' },
          navigation: {
            links: {
              home: { $xlg: 'Home Page', $md: 'Home', $sm: 'H' },
            },
          },
        },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        header: {
          title: { $xlg: 'Desktop Header' },
          navigation: {
            links: {
              home: { $xlg: 'Home Page', $sm: 'H' },
            },
          },
        },
      });
    });

    test('should handle very deeply nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: { $xlg: 'deep', $md: 'medium', $sm: 'shallow' },
              },
            },
          },
        },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              level4: {
                value: { $xlg: 'deep', $sm: 'shallow' },
              },
            },
          },
        },
      });
    });

    test('should handle mixed breakpoint and non-breakpoint properties', () => {
      const input = {
        config: {
          responsive: { $xlg: true, $md: false },
          staticValue: 'unchanged',
          nested: {
            dynamic: { $xlg: 100, $md: 50 },
            static: 42,
          },
        },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        config: {
          responsive: { $xlg: true },
          staticValue: 'unchanged',
          nested: {
            dynamic: { $xlg: 100 },
            static: 42,
          },
        },
      });
    });
  });

  describe('arrays', () => {
    test('should remove breakpoint from objects within arrays', () => {
      const input = {
        items: [{ title: { $xlg: 'Item 1 Desktop', $md: 'Item 1 Tablet' } }, { title: { $xlg: 'Item 2 Desktop', $md: 'Item 2 Tablet' } }],
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        items: [{ title: { $xlg: 'Item 1 Desktop' } }, { title: { $xlg: 'Item 2 Desktop' } }],
      });
    });

    test('should handle nested arrays with breakpoint objects', () => {
      const input = {
        sections: [
          {
            title: { $xlg: 'Section 1', $md: 'Sec 1' },
            items: [{ name: { $xlg: 'Item A', $md: 'A' } }, { name: { $xlg: 'Item B', $md: 'B' } }],
          },
        ],
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        sections: [
          {
            title: { $xlg: 'Section 1' },
            items: [{ name: { $xlg: 'Item A' } }, { name: { $xlg: 'Item B' } }],
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
        ],
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        mixedArray: [{ title: { $xlg: 'Object with breakpoint' } }, 'plain string', 42, { staticProp: 'no breakpoints here' }, null],
      });
    });
  });

  describe('immutability', () => {
    test('should not mutate the original object', () => {
      const original = {
        title: { $xlg: 'Desktop', $md: 'Tablet', $sm: 'Mobile' },
        nested: {
          value: { $xlg: 100, $md: 50 },
        },
      };

      const originalCopy = JSON.parse(JSON.stringify(original)) as typeof original;

      removeBreakpointData(original, 'md');

      expect(original).toEqual(originalCopy);
      expect(original.title).toEqual({ $xlg: 'Desktop', $md: 'Tablet', $sm: 'Mobile' });
      expect(original.nested.value).toEqual({ $xlg: 100, $md: 50 });
    });

    test('should create completely new object instances', () => {
      const original = {
        data: { $xlg: 'test', $md: 'tablet' },
        items: [{ value: { $xlg: 'item', $md: 'tab' } }],
      };

      const result = removeBreakpointData(original, 'md');

      expect(result).not.toBe(original);
      expect(result.data).not.toBe(original.data);
      expect(result.items).not.toBe(original.items);
      expect(result.items[0]).not.toBe(original.items[0]);
    });

    test('should not mutate frozen objects', () => {
      const original = {
        title: { $xlg: 'Desktop', $md: 'Tablet' },
        nested: {
          value: { $xlg: 100, $md: 50 },
        },
      };

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

      const frozen = deepFreeze(original);

      expect(() => {
        const result = removeBreakpointData(frozen, 'md');

        expect(result.title).toEqual({ $xlg: 'Desktop' });
        expect(result.nested.value).toEqual({ $xlg: 100 });
      }).not.toThrow();

      expect(frozen.title).toEqual({ $xlg: 'Desktop', $md: 'Tablet' });
    });
  });

  describe('JSX/React element handling', () => {
    test('should preserve JSX elements as-is', () => {
      const jsx = createElement('div', null, 'Content');
      const input = {
        component: jsx,
        title: { $xlg: 'Title', $md: 'Short' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result.component).toBe(jsx);
      expect(result.title).toEqual({ $xlg: 'Title' });
    });

    test('should preserve JSX elements in arrays', () => {
      const jsx1 = createElement('div', null, 'First');
      const jsx2 = createElement('span', null, 'Second');

      const input = {
        components: [jsx1, { title: { $xlg: 'Desktop', $md: 'Tablet' } }, jsx2],
      };

      const result = removeBreakpointData(input, 'md');

      expect((result.components as unknown[])[0]).toBe(jsx1);
      expect((result.components as { title: { $xlg: string } }[])[1].title).toEqual({ $xlg: 'Desktop' });
      expect((result.components as unknown[])[2]).toBe(jsx2);
    });

    test('should preserve JSX in nested structures', () => {
      const jsx = createElement('button', { type: 'button' }, 'Click');

      const input = {
        layout: {
          header: {
            title: { $xlg: 'Header', $md: 'Hdr' },
            action: jsx,
          },
        },
      };

      const result = removeBreakpointData(input, 'md');

      expect((result.layout as { header: { title: { $xlg: string }; action: unknown } }).header.action).toBe(jsx);
      expect((result.layout as { header: { title: { $xlg: string }; action: unknown } }).header.title).toEqual({ $xlg: 'Header' });
    });
  });

  describe('edge cases', () => {
    test('should handle null and undefined values', () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined,
        breakpoint: { $xlg: 'value', $md: 'tablet' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        nullValue: null,
        undefinedValue: undefined,
        breakpoint: { $xlg: 'value' },
      });
    });

    test('should handle empty objects and arrays', () => {
      const input = {
        emptyObject: {},
        emptyArray: [],
        withData: { $xlg: 'test', $md: 'tablet' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        emptyObject: {},
        emptyArray: [],
        withData: { $xlg: 'test' },
      });
    });

    test('should handle primitives as top-level input', () => {
      expect(removeBreakpointData('string', 'md')).toBe('string');
      expect(removeBreakpointData(42, 'md')).toBe(42);
      expect(removeBreakpointData(true, 'md')).toBe(true);
      expect(removeBreakpointData(null, 'md')).toBe(null);
      expect(removeBreakpointData(undefined, 'md')).toBe(undefined);
    });

    test('should handle top-level breakpoint object', () => {
      const input = {
        $xlg: 'Desktop',
        $md: 'Tablet',
        $sm: 'Mobile',
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        $xlg: 'Desktop',
        $sm: 'Mobile',
      });
    });

    test('should handle objects with various value types', () => {
      const input = {
        stringValue: { $xlg: 'string', $md: 'tablet' },
        numberValue: { $xlg: 100, $md: 50 },
        booleanValue: { $xlg: true, $md: false },
        arrayValue: { $xlg: [1, 2, 3], $md: [4, 5] },
        objectValue: { $xlg: { nested: 'value' }, $md: { nested: 'tablet' } },
        nullValue: { $xlg: null, $md: 'not null' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        stringValue: { $xlg: 'string' },
        numberValue: { $xlg: 100 },
        booleanValue: { $xlg: true },
        arrayValue: { $xlg: [1, 2, 3] },
        objectValue: { $xlg: { nested: 'value' } },
        nullValue: { $xlg: null },
      });
    });
  });

  describe('complex real-world scenarios', () => {
    test('should handle complex dashboard page data structure', () => {
      const input = {
        root: {
          props: {
            backgroundColor: { $xlg: '#ffffff', $md: '#f5f5f5', $sm: '#f0f0f0' },
            padding: { $xlg: 24, $sm: 16 },
          },
        },
        content: [
          {
            type: 'HeadingBlock',
            props: {
              id: 'heading-1',
              title: { $xlg: 'Dashboard Page', $md: 'Dashboard' },
              style: {
                fontSize: { $xlg: '2rem', $md: '1.5rem', $sm: '1.25rem' },
                color: { $xlg: '#333333' },
              },
            },
          },
        ],
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        root: {
          props: {
            backgroundColor: { $xlg: '#ffffff', $sm: '#f0f0f0' },
            padding: { $xlg: 24, $sm: 16 },
          },
        },
        content: [
          {
            type: 'HeadingBlock',
            props: {
              id: 'heading-1',
              title: { $xlg: 'Dashboard Page' },
              style: {
                fontSize: { $xlg: '2rem', $sm: '1.25rem' },
                color: { $xlg: '#333333' },
              },
            },
          },
        ],
      });
    });

    test('should handle component with slots containing breakpoint data', () => {
      const input = {
        content: [
          {
            type: 'Container',
            props: {
              id: 'container-1',
              padding: { $xlg: 20, $md: 15 },
              content: [
                {
                  type: 'Text',
                  props: {
                    id: 'text-1',
                    value: { $xlg: 'Long text', $md: 'Short text' },
                  },
                },
              ],
            },
          },
        ],
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        content: [
          {
            type: 'Container',
            props: {
              id: 'container-1',
              padding: { $xlg: 20 },
              content: [
                {
                  type: 'Text',
                  props: {
                    id: 'text-1',
                    value: { $xlg: 'Long text' },
                  },
                },
              ],
            },
          },
        ],
      });
    });
  });

  describe('removing different breakpoints', () => {
    test('should remove xxs breakpoint', () => {
      const input = {
        value: { $xxs: 1, $xs: 2, $xlg: 3 },
      };

      const result = removeBreakpointData(input, 'xxs');

      expect(result).toEqual({
        value: { $xs: 2, $xlg: 3 },
      });
    });

    test('should remove lg breakpoint', () => {
      const input = {
        value: { $lg: 'large', $xlg: 'extra large', $md: 'medium' },
      };

      const result = removeBreakpointData(input, 'lg');

      expect(result).toEqual({
        value: { $xlg: 'extra large', $md: 'medium' },
      });
    });

    test('should remove sm breakpoint from complex structure', () => {
      const input = {
        layout: {
          width: { $xlg: 1200, $lg: 1024, $md: 768, $sm: 640, $xs: 480 },
          padding: { $xlg: 24, $sm: 12 },
        },
      };

      const result = removeBreakpointData(input, 'sm');

      expect(result).toEqual({
        layout: {
          width: { $xlg: 1200, $lg: 1024, $md: 768, $xs: 480 },
          padding: { $xlg: 24 },
        },
      });
    });
  });

  describe('non-breakpoint objects', () => {
    test('should preserve regular objects that are not breakpoint objects', () => {
      const input = {
        config: {
          width: 100,
          height: 200,
        },
        title: { $xlg: 'Desktop', $md: 'Tablet' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        config: {
          width: 100,
          height: 200,
        },
        title: { $xlg: 'Desktop' },
      });
    });

    test('should handle objects with dollar-prefixed keys that are not valid breakpoints', () => {
      const input = {
        data: { $invalid: 'not a breakpoint', $xlg: 'valid', $md: 'tablet' },
        other: { normalKey: 'value' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        data: { $invalid: 'not a breakpoint', $xlg: 'valid' },
        other: { normalKey: 'value' },
      });
    });
  });

  describe('performance and large structures', () => {
    test('should handle large nested structures efficiently', () => {
      const input: {
        items: { id: string; title: { $xlg: string; $md: string }; nested: { value: { $xlg: number; $md: number } } }[];
      } = {
        items: [],
      };

      for (let i = 0; i < 100; i++) {
        input.items.push({
          id: `item-${i}`,
          title: { $xlg: `Item ${i} Desktop`, $md: `Item ${i} Tablet` },
          nested: {
            value: { $xlg: i * 100, $md: i * 50 },
          },
        });
      }

      const result = removeBreakpointData(input, 'md');

      expect(result.items).toHaveLength(100);
      expect(result.items[0].title).toEqual({ $xlg: 'Item 0 Desktop' });
      expect(result.items[0].nested.value).toEqual({ $xlg: 0 });
      expect(result.items[99].title).toEqual({ $xlg: 'Item 99 Desktop' });
      expect(result.items[99].nested.value).toEqual({ $xlg: 9900 });
    });
  });

  describe('special cases', () => {
    test('should handle breakpoint objects with only one key being removed', () => {
      const input = {
        singleBreakpoint: { $md: 'only this' },
        multipleBreakpoints: { $xlg: 'desktop', $md: 'tablet', $sm: 'mobile' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        singleBreakpoint: {},
        multipleBreakpoints: { $xlg: 'desktop', $sm: 'mobile' },
      });
    });

    test('should preserve non-$ prefixed keys that match breakpoint names', () => {
      const input = {
        md: 'This is not a breakpoint key',
        title: { $xlg: 'Desktop', $md: 'Tablet' },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        md: 'This is not a breakpoint key',
        title: { $xlg: 'Desktop' },
      });
    });

    test('should handle removing from PuckPageData structure', () => {
      const input = {
        root: {
          props: {
            backgroundColor: { $xlg: '#fff', $md: '#f5f5f5' },
          },
        },
        content: [
          {
            type: 'Component',
            props: {
              id: 'comp-1',
              value: { $xlg: 'desktop', $md: 'tablet' },
            },
          },
        ],
        zones: {
          sidebar: [
            {
              type: 'Widget',
              props: {
                id: 'widget-1',
                title: { $xlg: 'Sidebar', $md: 'Side' },
              },
            },
          ],
        },
      };

      const result = removeBreakpointData(input, 'md');

      expect(result).toEqual({
        root: {
          props: {
            backgroundColor: { $xlg: '#fff' },
          },
        },
        content: [
          {
            type: 'Component',
            props: {
              id: 'comp-1',
              value: { $xlg: 'desktop' },
            },
          },
        ],
        zones: {
          sidebar: [
            {
              type: 'Widget',
              props: {
                id: 'widget-1',
                title: { $xlg: 'Sidebar' },
              },
            },
          ],
        },
      });
    });
  });
});
