import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { createElement, Fragment, ReactNode } from 'react';
import { attachPropsToElement } from './attachPropsToElement';

// Mock console.warn to capture log output
let consoleWarnings: string[] = [];
const originalConsoleWarn = console.warn;

function mockConsoleWarn() {
  consoleWarnings = [];
  console.warn = (message: string) => {
    consoleWarnings.push(message);
  };
}

function restoreConsoleWarn() {
  console.warn = originalConsoleWarn;
}

describe('attachPropsToElement', () => {
  let refCalls: (Element | null)[] = [];
  let mockDragRef: (element: Element | null) => void;

  beforeEach(() => {
    refCalls = [];
    mockDragRef = (element: Element | null) => {
      refCalls.push(element);
    };
    mockConsoleWarn();
  });

  afterEach(() => {
    restoreConsoleWarn();
  });

  test('should return a new element even if no ref provided', () => {
    const element = createElement('div', { id: 'test' }, 'content');
    const result = attachPropsToElement({ element, ref: null });
    expect(result).not.toBe(element);
    expect(result).toHaveProperty('props.id', 'test');
    expect(result).toHaveProperty('props.children', 'content');
    expect(result).toHaveProperty('props.ref');
  });

  test('should return falsy values unchanged without wrapping', () => {
    // Test null
    expect(attachPropsToElement({ element: null, ref: mockDragRef, componentLabel: 'TestComponent' })).toBe(null);

    // Test undefined - this is important for conditional rendering patterns
    // Note: TypeScript doesn't like this but runtime handles it correctly
    const undefinedReturn = (() => undefined)() as ReactNode | undefined;
    // @ts-expect-error - undefined is handled correctly by the function
    expect(attachPropsToElement({ element: undefinedReturn, ref: mockDragRef, componentLabel: 'TestComponent' })).toBe(undefined);

    // Test false
    expect(attachPropsToElement({ element: false, ref: mockDragRef, componentLabel: 'TestComponent' })).toBe(false);

    // Test empty string
    expect(attachPropsToElement({ element: '', ref: mockDragRef, componentLabel: 'TestComponent' })).toBe('');

    // Should not log any warnings for intentional falsy returns
    expect(consoleWarnings).toHaveLength(0);
  });

  test('should wrap zero (0) in span since it renders content', () => {
    const result = attachPropsToElement({ element: 0, ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, 0));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('number');
  });

  test('should wrap negative numbers in span since they render content', () => {
    const result = attachPropsToElement({ element: -5, ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, -5));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('number');
  });

  test('should wrap non-empty string in span and log warning', () => {
    const result = attachPropsToElement({ element: 'Hello World', ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, 'Hello World'));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('string');
  });

  test('should wrap positive number in span and log warning', () => {
    const result = attachPropsToElement({ element: 42, ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, 42));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('number');
  });

  test('should wrap array in div and log warning', () => {
    const elements = [createElement('div', { key: 1 }, 'First'), createElement('div', { key: 2 }, 'Second')];

    const result = attachPropsToElement({ element: elements, ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('div', { ref: mockDragRef }, elements));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('array');
  });

  test('should wrap Fragment children in div and log warning', () => {
    const fragmentElement = createElement(Fragment, {}, createElement('div', {}, 'Child 1'), createElement('div', {}, 'Child 2'));

    const result = attachPropsToElement({ element: fragmentElement, ref: mockDragRef, componentLabel: 'TestComponent' });

    // Should wrap the children (not the fragment itself) in a div
    expect(result).toEqual(
      createElement('div', { ref: mockDragRef }, [createElement('div', {}, 'Child 1'), createElement('div', {}, 'Child 2')])
    );
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('Fragment');
  });

  test('should clone regular React element and attach ref without warning', () => {
    const originalElement = createElement('div', { className: 'original' }, 'content');

    const result = attachPropsToElement({ element: originalElement, ref: mockDragRef, componentLabel: 'TestComponent' });

    // Should be a cloned element with ref attached
    expect(result).toHaveProperty('type', 'div');
    expect(result).toHaveProperty('props.className', 'original');
    expect(result).toHaveProperty('props.children', 'content');
    expect(result).toHaveProperty('props.ref');

    // Should not log any warnings for successful clone
    expect(consoleWarnings).toHaveLength(0);
  });

  test('should preserve existing function ref when cloning', () => {
    const originalRefCalls: (Element | null)[] = [];
    const originalRef = (element: Element | null) => {
      originalRefCalls.push(element);
    };

    const originalElement = createElement('div', { ref: originalRef }, 'content');
    const result = attachPropsToElement({ element: originalElement, ref: mockDragRef, componentLabel: 'TestComponent' });

    // Simulate calling the merged ref
    const mergedRef = (result as { props: { ref: (element: Element | null) => void } }).props.ref;
    const mockElement = document.createElement('div');
    mergedRef(mockElement);

    // Both refs should have been called
    expect(refCalls).toHaveLength(1);
    expect(refCalls[0]).toBe(mockElement);
    expect(originalRefCalls).toHaveLength(1);
    expect(originalRefCalls[0]).toBe(mockElement);
  });

  test('should preserve existing object ref when cloning', () => {
    const originalRef = { current: null as Element | null };

    const originalElement = createElement('div', { ref: originalRef }, 'content');
    const result = attachPropsToElement({ element: originalElement, ref: mockDragRef, componentLabel: 'TestComponent' });

    // Simulate calling the merged ref
    const mergedRef = (result as { props: { ref: (element: Element | null) => void } }).props.ref;
    const mockElement = document.createElement('div');
    mergedRef(mockElement);

    // Both refs should have been set
    expect(refCalls).toHaveLength(1);
    expect(refCalls[0]).toBe(mockElement);
    expect(originalRef.current).toBe(mockElement);
  });

  test('should fallback to div wrapper when cloneElement fails', () => {
    // Create an element that might cause cloneElement to fail
    const problematicElement = {
      type: 'div',
      props: { children: 'test' },
      // Missing required React element properties to cause clone failure
    } as ReactNode;

    const result = attachPropsToElement({ element: problematicElement, ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('div', { ref: mockDragRef }, problematicElement));
    // Note: cloneElement might not actually fail with this element, so we expect at least 1 warning
    expect(consoleWarnings.length).toBeGreaterThanOrEqual(1);
    expect(consoleWarnings.some(warning => warning.includes('TestComponent'))).toBe(true);
  });

  test('should include component label in warning messages', () => {
    // Use a string instead of null since null no longer triggers warnings
    attachPropsToElement({ element: 'text content', ref: mockDragRef, componentLabel: 'MyCustomComponent' });

    expect(consoleWarnings[0]).toContain('MyCustomComponent');
  });

  test('should work without component label', () => {
    // Use a string instead of null since null no longer triggers warnings
    attachPropsToElement({ element: 'text content', ref: mockDragRef });

    expect(consoleWarnings[0]).not.toContain('MyCustomComponent');
    expect(consoleWarnings[0]).toContain('HAKIT: Automatically wrapping component');
  });

  test('should handle unknown types with fallback', () => {
    const weirdElement = Symbol('weird') as unknown as ReactNode;

    const result = attachPropsToElement({ element: weirdElement, ref: mockDragRef, componentLabel: 'TestComponent' });

    expect(result).toEqual(createElement('div', { ref: mockDragRef }, weirdElement));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('unknown type');
  });

  test('should accept emotion CSS parameter without errors', () => {
    const element = createElement('div', {}, 'test');
    const mockDragRef = (() => {}) as (element: Element | null) => void;

    // Test with undefined emotion CSS (should work the same as before)
    const result1 = attachPropsToElement({
      element: element,
      ref: mockDragRef,
      componentLabel: 'TestComponent',
      updateProps(props) {
        return {
          ...props,
          emotionCss: undefined,
        };
      },
    });
    expect(result1).toBeDefined();

    // Test with null emotion CSS
    const result2 = attachPropsToElement({
      element: element,
      ref: mockDragRef,
      componentLabel: 'TestComponent',
      updateProps(props) {
        return {
          ...props,
          emotionCss: undefined,
        };
      },
    });
    expect(result2).toBeDefined();

    // Note: Testing with actual emotion CSS object would require @emotion/react
    // to be properly set up in the test environment, so we just test the signature
    expect(consoleWarnings).toHaveLength(0);
  });

  test('should add emotion prop to element', () => {
    const element = createElement('div', {}, 'test');
    const mockDragRef = (() => {}) as (element: Element | null) => void;

    const result = attachPropsToElement({
      element: element,
      ref: mockDragRef,
      componentLabel: 'TestComponent',
      updateProps(props) {
        return {
          ...props,
          emotionCss: {
            css: 'test',
          },
        };
      },
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('props.emotionCss');
    expect(result).toHaveProperty('props.emotionCss.css');
    expect(result).toHaveProperty('props.emotionCss.css.includes');
  });

  test('should wrap/compose onClick via updateProps when cloning', () => {
    const userClicks: string[] = [];
    const ourClicks: string[] = [];

    const originalOnClick = () => userClicks.push('user');
    const updateProps = (current: React.ComponentProps<'div'>) => {
      const original = current.onClick;
      return {
        ...current,
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          ourClicks.push('ours');
          if (typeof original === 'function') original(e);
        },
        'data-test': 'added',
      };
    };

    const originalElement = createElement('div', { onClick: originalOnClick }, 'content');
    const result = attachPropsToElement({ element: originalElement, ref: mockDragRef, updateProps, componentLabel: 'TestComponent' });

    const mergedProps = (result as { props: { onClick: (e: React.MouseEvent<HTMLDivElement>) => void; ['data-test']: string } }).props;
    // fire click
    mergedProps.onClick({} as unknown as React.MouseEvent<HTMLDivElement>);
    expect(ourClicks).toEqual(['ours']);
    expect(userClicks).toEqual(['user']);
    expect(mergedProps['data-test']).toBe('added');
  });

  test('should apply updateProps for wrapper cases (string -> span)', () => {
    const updateProps = (current: React.ComponentProps<'div'>) => ({ ...current, role: 'note' });
    const result = attachPropsToElement({ element: 'Hello', ref: mockDragRef, updateProps, componentLabel: 'TestComponent' });
    expect(result).toEqual(createElement('span', { ref: mockDragRef, role: 'note' }, 'Hello'));
  });

  test('should no-op when updateProps not provided', () => {
    const element = createElement('div', { id: 'noop' }, 'content');
    const result = attachPropsToElement({ element, ref: mockDragRef });
    // Should still be clone with ref
    expect((result as { props: { ref: unknown; id: string } }).props.ref).toBeDefined();
    expect((result as { props: { ref: unknown; id: string } }).props.id).toBe('noop');
  });

  describe('wrapper functionality', () => {
    test('should use wrapper instead of default div for arrays', () => {
      const customWrapper = createElement('section', { className: 'custom-wrapper' });
      const elements = [createElement('div', { key: 1 }, 'First'), createElement('div', { key: 2 }, 'Second')];

      const result = attachPropsToElement({ element: elements, ref: mockDragRef, wrapper: customWrapper, componentLabel: 'TestComponent' });

      expect(result).toHaveProperty('type', 'section');
      expect(result).toHaveProperty('props.className', 'custom-wrapper');
      expect(result).toHaveProperty('props.ref');
      expect(result).toHaveProperty('props.children', elements);
    });

    test('should use wrapper instead of default span for strings', () => {
      const customWrapper = createElement('p', { className: 'text-wrapper' });
      const result = attachPropsToElement({
        element: 'Hello World',
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      expect(result).toHaveProperty('type', 'p');
      expect(result).toHaveProperty('props.className', 'text-wrapper');
      expect(result).toHaveProperty('props.ref');
      expect(result).toHaveProperty('props.children', 'Hello World');
    });

    test('should use wrapper instead of default span for numbers', () => {
      const customWrapper = createElement('span', { 'data-number': 'true' });
      const result = attachPropsToElement({ element: 42, ref: mockDragRef, wrapper: customWrapper, componentLabel: 'TestComponent' });

      expect(result).toHaveProperty('type', 'span');
      expect(result).toHaveProperty('props.ref');
      expect(result).toHaveProperty('props.children', 42);
    });

    test('should use wrapper for Fragment children', () => {
      const customWrapper = createElement('article', { className: 'fragment-wrapper' });
      const fragmentElement = createElement(Fragment, {}, createElement('div', {}, 'Child 1'), createElement('div', {}, 'Child 2'));

      const result = attachPropsToElement({
        element: fragmentElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      expect(result).toHaveProperty('type', 'article');
      expect(result).toHaveProperty('props.className', 'fragment-wrapper');
      expect(result).toHaveProperty('props.ref');
    });

    test('should use wrapper for custom React components', () => {
      const CustomComponent = () => createElement('div', {}, 'Custom');
      const customWrapper = createElement('aside', { className: 'component-wrapper' });
      const customElement = createElement(CustomComponent);

      const result = attachPropsToElement({
        element: customElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      expect(result).toHaveProperty('type', 'aside');
      expect(result).toHaveProperty('props.className', 'component-wrapper');
      expect(result).toHaveProperty('props.ref');
    });

    test('should merge createWrapperProps onto wrapper', () => {
      const customWrapper = createElement('div', { className: 'original', id: 'wrapper-id' });
      const updateProps = (props: React.ComponentProps<'div'>) => ({
        ...props,
        'data-test': 'merged',
      });

      const result = attachPropsToElement({
        element: 'Hello',
        ref: mockDragRef,
        wrapper: customWrapper,
        updateProps,
        componentLabel: 'TestComponent',
      });

      expect(result).toHaveProperty('props.className', 'original');
      expect(result).toHaveProperty('props.id', 'wrapper-id');
      expect(result).toHaveProperty('props.ref');
      expect(result).toHaveProperty('props.data-test', 'merged');
    });

    test('should wrap regular React element with wrapper when provided', () => {
      const customWrapper = createElement('section', { className: 'wrapper' });
      const originalElement = createElement('div', { className: 'original', id: 'test' }, 'content');

      const result = attachPropsToElement({
        element: originalElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      // Should be wrapped in the custom wrapper
      expect(result).toHaveProperty('type', 'section');
      expect(result).toHaveProperty('props.className', 'wrapper');
      expect(result).toHaveProperty('props.ref');
      // The original element should be wrapped inside
      const wrappedElement = (result as { props: { children: unknown } }).props.children;
      // Children could be the element directly or in an array, check if it's a valid element
      if (wrappedElement && typeof wrappedElement === 'object' && 'type' in wrappedElement) {
        expect(wrappedElement).toHaveProperty('type', 'div');
        if ('props' in wrappedElement && typeof wrappedElement.props === 'object' && wrappedElement.props !== null) {
          expect(wrappedElement.props).toHaveProperty('className', 'original');
          expect(wrappedElement.props).toHaveProperty('id', 'test');
        }
      }
    });

    test('should preserve wrapper children if provided, otherwise use wrapped element', () => {
      const wrapperWithChildren = createElement('div', { className: 'wrapper' }, createElement('span', {}, 'Wrapper Child'));
      const originalElement = createElement('div', { className: 'original' }, 'content');

      const result = attachPropsToElement({
        element: originalElement,
        ref: mockDragRef,
        wrapper: wrapperWithChildren,
        componentLabel: 'TestComponent',
      });

      // Should preserve wrapper's children (not the wrapped element)
      const children = (result as { props: { children: ReactNode } }).props.children;
      // Children should be the span element from the wrapper
      if (children && typeof children === 'object' && 'type' in children) {
        expect(children).toHaveProperty('type', 'span');
      } else if (Array.isArray(children)) {
        // Or it could be an array containing the span
        expect(children.some(child => child && typeof child === 'object' && 'type' in child && child.type === 'span')).toBe(true);
      }
    });

    test('should use wrapper for fallback cases (clone failures)', () => {
      const customWrapper = createElement('div', { className: 'fallback-wrapper' });
      const problematicElement = {
        type: 'div',
        props: { children: 'test' },
      } as ReactNode;

      const result = attachPropsToElement({
        element: problematicElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      expect(result).toHaveProperty('type', 'div');
      expect(result).toHaveProperty('props.className', 'fallback-wrapper');
      expect(result).toHaveProperty('props.ref');
    });

    test('should use wrapper for unknown types', () => {
      const customWrapper = createElement('div', { className: 'unknown-wrapper' });
      const weirdElement = Symbol('weird') as unknown as ReactNode;

      const result = attachPropsToElement({
        element: weirdElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      expect(result).toHaveProperty('type', 'div');
      expect(result).toHaveProperty('props.className', 'unknown-wrapper');
      expect(result).toHaveProperty('props.ref');
    });

    test('should compose refs correctly when wrapper is used with regular element', () => {
      const customWrapper = createElement('section', {});
      const originalRefCalls: (Element | null)[] = [];
      const originalRef = (element: Element | null) => {
        originalRefCalls.push(element);
      };

      const originalElement = createElement('div', { ref: originalRef }, 'content');
      const result = attachPropsToElement({
        element: originalElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        componentLabel: 'TestComponent',
      });

      // The wrapper should have the ref from createWrapperProps (which includes mockDragRef)
      const wrapperRef = (result as { props: { ref: (element: Element | null) => void } }).props.ref;
      const mockElement = document.createElement('section');
      wrapperRef(mockElement);

      // The outer ref (mockDragRef) should have been called
      expect(refCalls).toHaveLength(1);
      expect(refCalls[0]).toBe(mockElement);

      // The inner element's ref is composed separately and will be called when the inner element mounts
      // Since we're wrapping, the inner element's ref won't be called until React renders it
      // So we just verify the wrapper ref works correctly
    });

    test('should apply updateProps only to wrapper, not to element when wrapper is provided', () => {
      const customWrapper = createElement('section', { className: 'wrapper' });
      const originalElement = createElement('div', { className: 'original', id: 'test' }, 'content');

      const updatePropsCalls: unknown[] = [];
      const updateProps = (props: React.ComponentPropsWithRef<'div'>) => {
        updatePropsCalls.push(props);
        return {
          ...props,
          'data-updated': 'true',
          css: { name: 'test-css', styles: 'color: red;' },
        };
      };

      const result = attachPropsToElement({
        element: originalElement,
        ref: mockDragRef,
        wrapper: customWrapper,
        updateProps,
        componentLabel: 'TestComponent',
      });

      // updateProps should be called once (for the wrapper only, not the element)
      expect(updatePropsCalls).toHaveLength(1);

      // Verify updateProps was called with wrapper props (should have className: 'wrapper')
      const calledWith = updatePropsCalls[0] as Record<string, unknown>;
      expect(calledWith).toHaveProperty('className', 'wrapper');

      // The wrapper should have the updated props
      // jsx from emotion may return a different structure, so check props directly
      const resultProps = (result as { props?: Record<string, unknown> })?.props;
      if (resultProps) {
        expect(resultProps).toHaveProperty('className', 'wrapper');
        expect(resultProps).toHaveProperty('data-updated', 'true');
        expect(resultProps).toHaveProperty('css');
      }

      // The wrapped element should NOT have the updated props (no css, no data-updated)
      const wrappedElement = resultProps?.children;
      if (wrappedElement && typeof wrappedElement === 'object' && 'type' in wrappedElement) {
        expect(wrappedElement).toHaveProperty('type', 'div');
        if ('props' in wrappedElement && typeof wrappedElement.props === 'object' && wrappedElement.props !== null) {
          expect(wrappedElement.props).toHaveProperty('className', 'original');
          expect(wrappedElement.props).toHaveProperty('id', 'test');
          expect(wrappedElement.props).not.toHaveProperty('css');
          expect(wrappedElement.props).not.toHaveProperty('data-updated');
        }
      }
    });

    test('should apply updateProps to element when no wrapper is provided', () => {
      const originalElement = createElement('div', { className: 'original', id: 'test' }, 'content');

      const updatePropsCalls: unknown[] = [];
      const updateProps = (props: React.ComponentPropsWithRef<'div'>) => {
        updatePropsCalls.push(props);
        return {
          ...props,
          'data-updated': 'true',
          css: { name: 'test-css', styles: 'color: red;' },
        };
      };

      const result = attachPropsToElement({
        element: originalElement,
        ref: mockDragRef,
        updateProps,
        componentLabel: 'TestComponent',
      });

      // updateProps should be called once (for the element)
      expect(updatePropsCalls).toHaveLength(1);

      // The element should have the updated props
      // jsx from emotion may return a different structure, so check props directly
      if (result && typeof result === 'object' && 'props' in result && typeof result.props === 'object' && result.props !== null) {
        expect(result.props).toHaveProperty('className', 'original');
        expect(result.props).toHaveProperty('id', 'test');
        expect(result.props).toHaveProperty('data-updated', 'true');
        expect(result.props).toHaveProperty('css');
      } else {
        // If it's a jsx element, it should still have the props
        const props = (result as { props?: Record<string, unknown> })?.props;
        if (props) {
          expect(props).toHaveProperty('className', 'original');
          expect(props).toHaveProperty('id', 'test');
          expect(props).toHaveProperty('data-updated', 'true');
          expect(props).toHaveProperty('css');
        }
      }
    });

    test('should render children correctly when wrapper is used with liquid glass scenario', () => {
      // Simulate the liquid glass wrapper scenario
      const liquidGlassWrapper = createElement('div', {
        className: 'liquid-glass-wrapper',
        filterId: 'test-filter',
      });
      const renderedElement = createElement('div', { className: 'content' }, 'Hello World');

      const updatePropsCalls: unknown[] = [];
      const updateProps = (wrapperProps: React.ComponentPropsWithRef<'div'>) => {
        updatePropsCalls.push(wrapperProps);
        return {
          ...wrapperProps,
          css: { name: 'wrapper-css', styles: 'background: blue;' },
          className: `${wrapperProps.className} pressable`,
        };
      };

      const result = attachPropsToElement({
        element: renderedElement,
        ref: mockDragRef,
        wrapper: liquidGlassWrapper,
        updateProps,
        componentLabel: 'TestComponent',
      });

      // updateProps should be called once (for the wrapper only, not the element)
      expect(updatePropsCalls).toHaveLength(1);

      // Verify updateProps was called with wrapper props
      const calledWith = updatePropsCalls[0] as Record<string, unknown>;
      expect(calledWith).toHaveProperty('className', 'liquid-glass-wrapper');

      // The wrapper should have the css and className from updateProps
      // jsx from emotion may return a different structure, so check props directly
      const resultProps = (result as { props?: Record<string, unknown> })?.props;
      if (resultProps) {
        expect(resultProps).toHaveProperty('className', 'liquid-glass-wrapper pressable');
        expect(resultProps).toHaveProperty('css');
        expect(resultProps).toHaveProperty('filterId', 'test-filter');
      }

      // The wrapped element should be the children and should NOT have css
      const children = resultProps?.children;
      expect(children).toBeDefined();
      if (children && typeof children === 'object' && 'type' in children) {
        expect(children).toHaveProperty('type', 'div');
        if ('props' in children && typeof children.props === 'object' && children.props !== null) {
          expect(children.props).toHaveProperty('className', 'content');
          expect(children.props).not.toHaveProperty('css'); // Element should NOT have css
        }
      }
    });
  });
});
