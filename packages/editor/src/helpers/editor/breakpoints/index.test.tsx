import { expect, test, describe } from 'bun:test';
import { breakpointItemToBreakPoints } from './index';
import type { BreakpointItem } from '@typings/breakpoints';

describe('breakpointItemToBreakPoints', () => {
  test('Should convert enabled breakpoint items to BreakPoints object', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'xs',
        title: 'Extra Small',
        width: 480,
        disabled: false,
        editable: true,
      },
      {
        id: 'sm',
        title: 'Small',
        width: 768,
        disabled: false,
        editable: true,
      },
      {
        id: 'md',
        title: 'Medium',
        width: 1024,
        disabled: false,
        editable: true,
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({
      xs: 480,
      sm: 768,
      md: 1024,
    });
  });

  test('Should filter out disabled breakpoints', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'xs',
        title: 'Extra Small',
        width: 480,
        disabled: false,
        editable: true,
      },
      {
        id: 'sm',
        title: 'Small',
        width: 768,
        disabled: true, // This should be filtered out
        editable: true,
      },
      {
        id: 'md',
        title: 'Medium',
        width: 1024,
        disabled: false,
        editable: true,
      },
      {
        id: 'lg',
        title: 'Large',
        width: 1200,
        disabled: true, // This should be filtered out
        editable: false,
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({
      xs: 480,
      md: 1024,
    });
  });

  test('Should handle empty array', () => {
    const breakpointItems: BreakpointItem[] = [];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({});
  });

  test('Should handle array with all disabled breakpoints', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'xs',
        title: 'Extra Small',
        width: 480,
        disabled: true,
        editable: true,
      },
      {
        id: 'sm',
        title: 'Small',
        width: 768,
        disabled: true,
        editable: true,
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({});
  });

  test('Should handle single enabled breakpoint', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'lg',
        title: 'Large',
        width: 1200,
        disabled: false,
        editable: false,
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({
      lg: 1200,
    });
  });

  test('Should preserve all properties except disabled ones', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'xxs',
        title: 'Extra Extra Small',
        width: 320,
        disabled: false,
        editable: false,
      },
      {
        id: 'xs',
        title: 'Extra Small',
        width: 480,
        disabled: false,
        editable: true,
      },
      {
        id: 'sm',
        title: 'Small',
        width: 768,
        disabled: true,
        editable: true,
      },
      {
        id: 'md',
        title: 'Medium',
        width: 1024,
        disabled: false,
        editable: false,
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({
      xxs: 320,
      xs: 480,
      md: 1024,
    });

    // Ensure the disabled breakpoint is not included
    expect(result).not.toHaveProperty('sm');
  });

  test('Should handle mixed editable and non-editable breakpoints', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'xs',
        title: 'Extra Small',
        width: 480,
        disabled: false,
        editable: false, // Non-editable but enabled
      },
      {
        id: 'sm',
        title: 'Small',
        width: 768,
        disabled: false,
        editable: true, // Editable and enabled
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({
      xs: 480,
      sm: 768,
    });
  });

  test('Should handle different width values correctly', () => {
    const breakpointItems: BreakpointItem[] = [
      {
        id: 'xs',
        title: 'Extra Small',
        width: 0, // Edge case: zero width
        disabled: false,
        editable: true,
      },
      {
        id: 'sm',
        title: 'Small',
        width: 999999, // Edge case: very large width
        disabled: false,
        editable: true,
      },
    ];

    const result = breakpointItemToBreakPoints(breakpointItems);

    expect(result).toEqual({
      xs: 0,
      sm: 999999,
    });
  });
});
