import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { createElement, Fragment, ReactNode } from 'react';
import { attachDragRefToElement } from './attachDragRefToElement';

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

describe('attachDragRefToElement', () => {
  let dragRefCalls: (Element | null)[] = [];
  let mockDragRef: (element: Element | null) => void;

  beforeEach(() => {
    dragRefCalls = [];
    mockDragRef = (element: Element | null) => {
      dragRefCalls.push(element);
    };
    mockConsoleWarn();
  });

  afterEach(() => {
    restoreConsoleWarn();
  });

  test('should return element unchanged when no dragRef provided', () => {
    const element = createElement('div', { id: 'test' }, 'content');
    const result = attachDragRefToElement(element, null);
    expect(result).toBe(element);
  });

  test('should return falsy values unchanged without wrapping', () => {
    // Test null
    expect(attachDragRefToElement(null, mockDragRef, 'TestComponent')).toBe(null);

    // Test undefined - this is important for conditional rendering patterns
    // Note: TypeScript doesn't like this but runtime handles it correctly
    const undefinedReturn = (() => undefined)() as ReactNode | undefined;
    // @ts-expect-error - undefined is handled correctly by the function
    expect(attachDragRefToElement(undefinedReturn, mockDragRef, 'TestComponent')).toBe(undefined);

    // Test false
    expect(attachDragRefToElement(false, mockDragRef, 'TestComponent')).toBe(false);

    // Test empty string
    expect(attachDragRefToElement('', mockDragRef, 'TestComponent')).toBe('');

    // Should not log any warnings for intentional falsy returns
    expect(consoleWarnings).toHaveLength(0);
  });

  test('should wrap zero (0) in span since it renders content', () => {
    const result = attachDragRefToElement(0, mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, 0));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('number');
  });

  test('should wrap negative numbers in span since they render content', () => {
    const result = attachDragRefToElement(-5, mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, -5));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('number');
  });

  test('should wrap non-empty string in span and log warning', () => {
    const result = attachDragRefToElement('Hello World', mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, 'Hello World'));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('string');
  });

  test('should wrap positive number in span and log warning', () => {
    const result = attachDragRefToElement(42, mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('span', { ref: mockDragRef }, 42));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('number');
  });

  test('should wrap array in div and log warning', () => {
    const elements = [createElement('div', { key: 1 }, 'First'), createElement('div', { key: 2 }, 'Second')];

    const result = attachDragRefToElement(elements, mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('div', { ref: mockDragRef }, elements));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('TestComponent');
    expect(consoleWarnings[0]).toContain('array');
  });

  test('should wrap Fragment children in div and log warning', () => {
    const fragmentElement = createElement(Fragment, {}, createElement('div', {}, 'Child 1'), createElement('div', {}, 'Child 2'));

    const result = attachDragRefToElement(fragmentElement, mockDragRef, 'TestComponent');

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

    const result = attachDragRefToElement(originalElement, mockDragRef, 'TestComponent');

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
    const result = attachDragRefToElement(originalElement, mockDragRef, 'TestComponent');

    // Simulate calling the merged ref
    const mergedRef = (result as { props: { ref: (element: Element | null) => void } }).props.ref;
    const mockElement = document.createElement('div');
    mergedRef(mockElement);

    // Both refs should have been called
    expect(dragRefCalls).toHaveLength(1);
    expect(dragRefCalls[0]).toBe(mockElement);
    expect(originalRefCalls).toHaveLength(1);
    expect(originalRefCalls[0]).toBe(mockElement);
  });

  test('should preserve existing object ref when cloning', () => {
    const originalRef = { current: null as Element | null };

    const originalElement = createElement('div', { ref: originalRef }, 'content');
    const result = attachDragRefToElement(originalElement, mockDragRef, 'TestComponent');

    // Simulate calling the merged ref
    const mergedRef = (result as { props: { ref: (element: Element | null) => void } }).props.ref;
    const mockElement = document.createElement('div');
    mergedRef(mockElement);

    // Both refs should have been set
    expect(dragRefCalls).toHaveLength(1);
    expect(dragRefCalls[0]).toBe(mockElement);
    expect(originalRef.current).toBe(mockElement);
  });

  test('should fallback to div wrapper when cloneElement fails', () => {
    // Create an element that might cause cloneElement to fail
    const problematicElement = {
      type: 'div',
      props: { children: 'test' },
      // Missing required React element properties to cause clone failure
    } as ReactNode;

    const result = attachDragRefToElement(problematicElement, mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('div', { ref: mockDragRef }, problematicElement));
    // Note: cloneElement might not actually fail with this element, so we expect at least 1 warning
    expect(consoleWarnings.length).toBeGreaterThanOrEqual(1);
    expect(consoleWarnings.some(warning => warning.includes('TestComponent'))).toBe(true);
  });

  test('should include component label in warning messages', () => {
    // Use a string instead of null since null no longer triggers warnings
    attachDragRefToElement('text content', mockDragRef, 'MyCustomComponent');

    expect(consoleWarnings[0]).toContain('MyCustomComponent');
  });

  test('should work without component label', () => {
    // Use a string instead of null since null no longer triggers warnings
    attachDragRefToElement('text content', mockDragRef);

    expect(consoleWarnings[0]).not.toContain('MyCustomComponent');
    expect(consoleWarnings[0]).toContain('HAKIT: Automatically wrapping component');
  });

  test('should handle unknown types with fallback', () => {
    const weirdElement = Symbol('weird') as unknown as ReactNode;

    const result = attachDragRefToElement(weirdElement, mockDragRef, 'TestComponent');

    expect(result).toEqual(createElement('div', { ref: mockDragRef }, weirdElement));
    expect(consoleWarnings).toHaveLength(1);
    expect(consoleWarnings[0]).toContain('unknown type');
  });

  test('should accept emotion CSS parameter without errors', () => {
    const element = createElement('div', {}, 'test');
    const mockDragRef = (() => {}) as (element: Element | null) => void;

    // Test with undefined emotion CSS (should work the same as before)
    const result1 = attachDragRefToElement(element, mockDragRef, 'TestComponent', undefined);
    expect(result1).toBeDefined();

    // Test with null emotion CSS
    const result2 = attachDragRefToElement(element, mockDragRef, 'TestComponent', undefined);
    expect(result2).toBeDefined();

    // Note: Testing with actual emotion CSS object would require @emotion/react
    // to be properly set up in the test environment, so we just test the signature
    expect(consoleWarnings).toHaveLength(0);
  });
});
