import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { createModuleMocker } from '../test-utils/moduleMocker';
import { mockData } from './__mocks__/data';
import { mockConfig } from './__mocks__/config';

let useBreadcrumbs: (renderCount?: number) => Array<{ label: string; selector: { index: number; zone?: string } | null }>;
const moduleMocker = createModuleMocker();

// Shared mutable state so the hook always reads the latest selector
const sharedState: { selector: { index?: number; zone?: string } | null } = { selector: null };

function setupPuckMock() {
  const store = {
    config: mockConfig,
    appState: {
      data: mockData,
      ui: {
        get itemSelector() {
          return sharedState.selector;
        },
      },
    },
  };
  return {
    createUsePuck() {
      return function usePuck<T>(selector: (c: typeof store) => T): T {
        return selector(store);
      };
    },
  };
}

async function importHook() {
  const mod = await import('./useBreadcrumbs');
  useBreadcrumbs = mod.useBreadcrumbs;
}

describe('useBreadcrumbs', () => {
  beforeAll(async () => {
    await moduleMocker.mock('@measured/puck', () => setupPuckMock());
    await importHook();
  });

  beforeEach(() => {
    sharedState.selector = null;
  });

  it('returns default Dashboard crumb when itemSelector is null', () => {
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(1);
    expect(result.current[0].label).toBe('Dashboard');
    expect(result.current[0].selector).toBeNull();
  });

  it('returns 6 items for deepest selector and last item matches target', () => {
    sharedState.selector = { index: 0, zone: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297:content' };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(6);
    const last = result.current[result.current.length - 1];
    expect(last.selector).toEqual({ index: 0, zone: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297:content' });
  });

  it('returns 5 items for next container up', () => {
    sharedState.selector = { index: 0, zone: 'Navigation-b38ec5da-b7c9-430f-9b3e-ca0022d2e4cc:content' };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(5);
  });

  it('returns 4 items for next container up', () => {
    sharedState.selector = { zone: 'Navigation-763e164a-e512-457c-9947-8be9c0891516:content', index: 0 };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(4);
  });

  it('returns 3 items one more level up', () => {
    sharedState.selector = { index: 0, zone: 'Navigation-d0562754-5c7d-46a0-a7a9-30c86aef00da:content' };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(3);
  });

  it('returns 2 items for root:content', () => {
    sharedState.selector = { zone: 'root:content', index: 0 };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(2);
  });

  it('returns 1 for invalid container id but valid format', () => {
    sharedState.selector = { index: 0, zone: 'NotARealId:content' };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.length).toBe(1);
  });

  it('returns [] for invalid zone format (no colon)', () => {
    sharedState.selector = { index: 0, zone: 'InvalidZone' } as unknown as { index?: number; zone?: string };
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current).toEqual([]);
  });

  it('slices with renderCount (keep only last 2 of 6)', () => {
    sharedState.selector = { index: 0, zone: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297:content' };
    const { result: base } = renderHook(() => useBreadcrumbs());
    expect(base.current.length).toBe(6);
    const { result: sliced } = renderHook(() => useBreadcrumbs(2));
    expect(sliced.current.length).toBe(2);
    expect(sliced.current).toEqual(base.current.slice(-2));
  });

  it('renderCount greater than length returns full array', () => {
    sharedState.selector = { zone: 'root:content', index: 0 };
    const { result: base } = renderHook(() => useBreadcrumbs());
    expect(base.current.length).toBe(2);
    const { result: sliced } = renderHook(() => useBreadcrumbs(10));
    expect(sliced.current.length).toBe(2);
  });

  it('renderCount <= 0 behaves like no slicing', () => {
    sharedState.selector = { index: 0, zone: 'Navigation-b38ec5da-b7c9-430f-9b3e-ca0022d2e4cc:content' };
    const { result: base } = renderHook(() => useBreadcrumbs());
    expect(base.current.length).toBe(5);
    const { result: zero } = renderHook(() => useBreadcrumbs(0));
    const { result: neg } = renderHook(() => useBreadcrumbs(-3));
    expect(zero.current).toEqual(base.current);
    expect(neg.current).toEqual(base.current);
  });
});
