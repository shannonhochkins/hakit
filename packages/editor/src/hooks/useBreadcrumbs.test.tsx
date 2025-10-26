import { describe, it, expect } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { mockData } from './__mocks__/data';
import { mockConfig } from './__mocks__/config';
import { Puck } from '@measured/puck';
import { useBreadcrumbs } from './useBreadcrumbs';
import React from 'react';

type Selector = { index: number; zone?: string } | null;

function makeWrapper(selector: Selector): React.FC<{ children: React.ReactNode }> {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Deep clone then cast for test harness
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mutableData: any = JSON.parse(JSON.stringify(mockData));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mutableConfig: any = JSON.parse(JSON.stringify(mockConfig));
    return (
      <Puck
        data={mutableData}
        config={mutableConfig}
        ui={{
          itemSelector: selector,
        }}
      >
        {children}
      </Puck>
    );
  };
  return Wrapper;
}

describe('useBreadcrumbs', () => {
  it('returns default Dashboard crumb when itemSelector is null', () => {
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(null) });
    expect(result.current.length).toBe(1);
    expect(result.current[0].label).toBe('Dashboard');
    expect(result.current[0].selector).toBeNull();
  });

  it('returns 6 items for deepest selector and last item matches target', () => {
    const selector = { index: 0, zone: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297:content' };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current.length).toBe(6);
    const last = result.current[result.current.length - 1];
    expect(last.selector).toEqual({ index: 0, zone: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297:content' });
  });

  it('returns 5 items for next container up', () => {
    const selector = { index: 0, zone: 'Navigation-b38ec5da-b7c9-430f-9b3e-ca0022d2e4cc:content' };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current.length).toBe(5);
  });

  it('returns 4 items for next container up', () => {
    const selector = { zone: 'Navigation-763e164a-e512-457c-9947-8be9c0891516:content', index: 0 };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current.length).toBe(4);
  });

  it('returns 3 items one more level up', () => {
    const selector = { index: 0, zone: 'Navigation-d0562754-5c7d-46a0-a7a9-30c86aef00da:content' };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current.length).toBe(3);
  });

  it('returns 2 items for root:content', () => {
    const selector = { zone: 'root:content', index: 0 };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current.length).toBe(2);
  });

  it('returns 1 for invalid container id but valid format', () => {
    const selector = { index: 0, zone: 'NotARealId:content' };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current.length).toBe(1);
  });

  it('returns [] for invalid zone format (no colon)', () => {
    const selector = { index: 0, zone: 'InvalidZone' } as { index: number; zone?: string };
    const { result } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(result.current).toEqual([
      {
        id: 'root',
        isFirst: true,
        isLast: true,
        label: 'Dashboard',
        selector: null,
      },
    ]);
  });

  it('slices with renderCount (keep only last 2 of 6)', () => {
    const selector = { index: 0, zone: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297:content' };
    const { result: base } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(base.current.length).toBe(6);
    const { result: sliced } = renderHook(() => useBreadcrumbs(2), { wrapper: makeWrapper(selector) });
    expect(sliced.current.length).toBe(2);
    expect(sliced.current).toEqual(base.current.slice(-2));
  });

  it('renderCount greater than length returns full array', () => {
    const selector = { zone: 'root:content', index: 0 };
    const { result: base } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(base.current.length).toBe(2);
    const { result: sliced } = renderHook(() => useBreadcrumbs(10), { wrapper: makeWrapper(selector) });
    expect(sliced.current.length).toBe(2);
  });

  it('renderCount <= 0 behaves like no slicing', () => {
    const selector = { index: 0, zone: 'Navigation-b38ec5da-b7c9-430f-9b3e-ca0022d2e4cc:content' };
    const { result: base } = renderHook(() => useBreadcrumbs(), { wrapper: makeWrapper(selector) });
    expect(base.current.length).toBe(5);
    const { result: zero } = renderHook(() => useBreadcrumbs(0), { wrapper: makeWrapper(selector) });
    const { result: neg } = renderHook(() => useBreadcrumbs(-3), { wrapper: makeWrapper(selector) });
    expect(zero.current).toEqual(base.current);
    expect(neg.current).toEqual(base.current);
  });
});
