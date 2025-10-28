// usePressGestures.test.ts
//
// Runner: Bun (bun:test)
// DOM/test utils: @testing-library/react (+ Happy DOM/global-registrator in preload)
// Hook under test exports: usePressGestures, constants, and PressHandlers
//
// This suite aims for one-behavior-per-test; lots of small tests.
// All mocks use Bun's `mock()` (jest-compatible). No Vitest `vi`.
// We use real timers; timing assertions add small sleeps around exported constants.
//

import { describe, test, expect, mock, beforeAll, afterEach } from 'bun:test';
import { render, renderHook, fireEvent, screen, cleanup } from '@testing-library/react';
import type { PressHandlers } from './usePressGestures';
import type { ComponentProps } from 'react';

const sleep = (ms: number) => new Promise(res => setTimeout(res, Math.max(0, ms)));
const NEXT_TICK = () => new Promise(res => queueMicrotask(res));

type DivProps = ComponentProps<'div'>;

// ---------- helpers ----------

function TestPressable({ handlers, props = {}, testId = 'pressable' }: { handlers: PressHandlers; props?: DivProps; testId?: string }) {
  const { bindWithProps } = usePressGestures(handlers);
  return <div data-testid={testId} {...bindWithProps(props)} />;
}

// Speed up this file by mocking hook delays lower, then dynamically importing the module
let usePressGestures: typeof import('./usePressGestures').usePressGestures;
let DOUBLE_TAP_DELAY: number;
let HOLD_DELAY: number;
let MOVE_TOLERANCE_MOUSE: number;
let MOVE_TOLERANCE_TOUCH: number;

beforeAll(async () => {
  const modPath = new URL('./usePressGestures.ts', import.meta.url).pathname;
  const actual = await import(modPath);
  mock.module(modPath, () => ({
    ...actual,
    DOUBLE_TAP_DELAY: 30,
    HOLD_DELAY: 40,
  }));
  const mod = await import(modPath);
  usePressGestures = mod.usePressGestures;
  DOUBLE_TAP_DELAY = mod.DOUBLE_TAP_DELAY;
  HOLD_DELAY = mod.HOLD_DELAY;
  MOVE_TOLERANCE_MOUSE = mod.MOVE_TOLERANCE_MOUSE;
  MOVE_TOLERANCE_TOUCH = mod.MOVE_TOLERANCE_TOUCH;
});
afterEach(() => {
  cleanup();
});

function pointerDown(node: Element, opts: Partial<PointerEventInit & { button: number; pointerId: number; pointerType: string }> = {}) {
  fireEvent.pointerDown(node, {
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: 10,
    clientY: 10,
    ...opts,
  });
}
function pointerMove(node: Element, opts: Partial<PointerEventInit & { pointerId: number; pointerType: string }> = {}) {
  fireEvent.pointerMove(node, {
    pointerId: 1,
    pointerType: 'mouse',
    clientX: 10,
    clientY: 10,
    ...opts,
  });
}
function pointerUp(node: Element, opts: Partial<PointerEventInit & { button: number; pointerId: number; pointerType: string }> = {}) {
  fireEvent.pointerUp(node, {
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: 10,
    clientY: 10,
    ...opts,
  });
}
function pointerCancel(node: Element, opts: Partial<PointerEventInit & { pointerId: number; pointerType: string }> = {}) {
  fireEvent.pointerCancel(node, { pointerId: 1, pointerType: 'mouse', ...opts });
}
function contextMenu(node: Element) {
  fireEvent.contextMenu(node);
}
function keyDownEnter(node: Element) {
  fireEvent.keyDown(node, { key: 'Enter' });
}
function keyUpEnter(node: Element) {
  fireEvent.keyUp(node, { key: 'Enter' });
}
function keyDownSpace(node: Element) {
  fireEvent.keyDown(node, { key: ' ' });
}
function keyUpSpace(node: Element) {
  fireEvent.keyUp(node, { key: ' ' });
}

// --------------------------------------------------------------------------------------
// Baseline: no handlers → pass-through
// --------------------------------------------------------------------------------------

describe('usePressGestures — no handlers', () => {
  test('returns props unchanged', () => {
    const { result } = renderHook(() => usePressGestures({}));
    const original: DivProps = { id: 'x', className: 'y', onClick: () => {} };
    const merged = result.current.bindWithProps(original);
    expect(merged).toEqual(original);
  });

  test('does not prevent contextmenu when no gestures are present', () => {
    const ext = { onContextMenu: mock(() => {}) };
    render(<TestPressable handlers={{}} props={{ ...ext }} />);
    const el = screen.getByTestId('pressable');
    contextMenu(el);
    expect(ext.onContextMenu).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Tap only (immediate path)
// --------------------------------------------------------------------------------------

describe('usePressGestures — tap only', () => {
  test('fires onTap immediately on pointerup (mouse)', () => {
    const onTap = mock(() => {});
    render(<TestPressable handlers={{ onTap }} />);
    const el = screen.getByTestId('pressable');

    pointerDown(el);
    pointerUp(el);

    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('maps user onClick exactly once when onTap is provided', () => {
    const onTap = mock(() => {});
    const onClick = mock(() => {});
    render(<TestPressable handlers={{ onTap }} props={{ onClick }} />);
    const el = screen.getByTestId('pressable');

    pointerDown(el);
    pointerUp(el);

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('keyboard Enter triggers onTap', () => {
    const onTap = mock(() => {});
    render(<TestPressable handlers={{ onTap }} />);
    const el = screen.getByTestId('pressable');
    keyDownEnter(el);
    keyUpEnter(el);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('keyboard Space triggers onTap', () => {
    const onTap = mock(() => {});
    render(<TestPressable handlers={{ onTap }} />);
    const el = screen.getByTestId('pressable');
    keyDownSpace(el);
    keyUpSpace(el);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('ignores non-primary button', () => {
    const onTap = mock(() => {});
    render(<TestPressable handlers={{ onTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el, { button: 1 });
    pointerUp(el, { button: 1 });
    expect(onTap).toHaveBeenCalledTimes(0);
  });

  test('pointerleave between down & up does not prevent tap', () => {
    const onTap = mock(() => {});
    render(<TestPressable handlers={{ onTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    fireEvent.pointerLeave(el, { pointerId: 1 });
    pointerUp(el);
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Double-tap only
// --------------------------------------------------------------------------------------

describe('usePressGestures — double-tap only', () => {
  test('single tap does not fire anything (waiting for second)', async () => {
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(DOUBLE_TAP_DELAY + 30);
    expect(onDoubleTap).toHaveBeenCalledTimes(0);
  });

  test('two taps within the threshold fire onDoubleTap', async () => {
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(DOUBLE_TAP_DELAY - 40);
    pointerDown(el);
    pointerUp(el);
    await NEXT_TICK();
    expect(onDoubleTap).toHaveBeenCalledTimes(1);
  });

  test('does not map onDoubleClick when onDoubleTap is not provided', async () => {
    const onDoubleClick = mock(() => {});
    render(<TestPressable handlers={{}} props={{ onDoubleClick }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(20);
    pointerDown(el);
    pointerUp(el);
    // We didn't intercept; ensure user's handler still ran at least once
    expect(onDoubleClick).toHaveBeenCalled();
  });
});

// --------------------------------------------------------------------------------------
// Tap + Double-tap (no cancel → defer tap)
// --------------------------------------------------------------------------------------

describe('usePressGestures — tap + double-tap (no cancel)', () => {
  test('defers tap; fires after window if no second tap', async () => {
    const onTap = mock(() => {});
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onTap, onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    expect(onTap).toHaveBeenCalledTimes(0);
    await sleep(DOUBLE_TAP_DELAY + 20);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).toHaveBeenCalledTimes(0);
  });

  test('fires double-tap and never fires tap if second tap is within window', async () => {
    const onTap = mock(() => {});
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onTap, onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(DOUBLE_TAP_DELAY - 40);
    pointerDown(el);
    pointerUp(el);
    await sleep(30);
    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledTimes(0);
  });
});

// --------------------------------------------------------------------------------------
// Tap + Double-tap (with cancel → immediate tap)
// --------------------------------------------------------------------------------------

describe('usePressGestures — tap + double-tap (with onTapCancel)', () => {
  test('fires tap immediately on first release', () => {
    const onTap = mock(() => {});
    const onTapCancel = mock(() => {});
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onTap, onTapCancel, onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).toHaveBeenCalledTimes(0);
  });

  test('fires onTapCancel before onDoubleTap when second tap arrives', async () => {
    const onTap = mock(() => {});
    const onTapCancel = mock(() => {});
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onTap, onTapCancel, onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(DOUBLE_TAP_DELAY - 50);
    pointerDown(el);
    pointerUp(el);
    await NEXT_TICK();
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTapCancel).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).toHaveBeenCalledTimes(1);
  });

  test('maps onClick (once) and onDoubleClick (once) appropriately', async () => {
    const onTap = mock(() => {});
    const onTapCancel = mock(() => {});
    const onDoubleTap = mock(() => {});
    const onClick = mock(() => {});
    const onDoubleClick = mock(() => {});
    render(<TestPressable handlers={{ onTap, onTapCancel, onDoubleTap }} props={{ onClick, onDoubleClick }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(DOUBLE_TAP_DELAY - 30);
    pointerDown(el);
    pointerUp(el);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Hold
// --------------------------------------------------------------------------------------

describe('usePressGestures — hold only', () => {
  test('fires onHold after HOLD_DELAY', async () => {
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    await sleep(HOLD_DELAY + 30);
    expect(onHold).toHaveBeenCalledTimes(1);
  });

  test('does not fire onHold if released before HOLD_DELAY', async () => {
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    await sleep(HOLD_DELAY - 100);
    pointerUp(el);
    await sleep(50);
    expect(onHold).toHaveBeenCalledTimes(0);
  });

  test('movement beyond mouse tolerance cancels hold', async () => {
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el, { pointerType: 'mouse', clientX: 0, clientY: 0 });
    pointerMove(el, { pointerType: 'mouse', clientX: MOVE_TOLERANCE_MOUSE + 1, clientY: 0 });
    await sleep(HOLD_DELAY + 20);
    expect(onHold).toHaveBeenCalledTimes(0);
  });

  test('movement beyond touch tolerance cancels hold', async () => {
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el, { pointerType: 'touch', clientX: 0, clientY: 0 });
    pointerMove(el, { pointerType: 'touch', clientX: MOVE_TOLERANCE_TOUCH + 1, clientY: 0 });
    await sleep(HOLD_DELAY + 20);
    expect(onHold).toHaveBeenCalledTimes(0);
  });
});

describe('usePressGestures — tap + hold', () => {
  test('tap fires when released before HOLD_DELAY', async () => {
    const onTap = mock(() => {});
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onTap, onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    await sleep(HOLD_DELAY - 150);
    pointerUp(el);
    expect(onHold).toHaveBeenCalledTimes(0);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('tap does NOT fire after hold has fired', async () => {
    const onTap = mock(() => {});
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onTap, onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    await sleep(HOLD_DELAY + 20);
    pointerUp(el);
    expect(onHold).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledTimes(0);
  });
});

// --------------------------------------------------------------------------------------
// Cancellations & leaves
// --------------------------------------------------------------------------------------

describe('usePressGestures — cancellation semantics', () => {
  test('pointercancel clears everything (no tap/hold/double)', async () => {
    const onTap = mock(() => {});
    const onDoubleTap = mock(() => {});
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onTap, onDoubleTap, onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    await sleep(10);
    pointerCancel(el);
    await sleep(DOUBLE_TAP_DELAY + 20);
    expect(onTap).toHaveBeenCalledTimes(0);
    expect(onDoubleTap).toHaveBeenCalledTimes(0);
    expect(onHold).toHaveBeenCalledTimes(0);
  });

  test('pointerleave does not cancel a pending single tap (defer path)', async () => {
    const onTap = mock(() => {});
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onTap, onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    fireEvent.pointerLeave(el, { pointerId: 1 });
    await sleep(DOUBLE_TAP_DELAY + 25);
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Multi-target & multi-pointer
// --------------------------------------------------------------------------------------

describe('usePressGestures — multi-target & multi-pointer guards', () => {
  test('double-tap requires same target', async () => {
    const onDoubleTap = mock(() => {});
    render(
      <>
        <TestPressable handlers={{ onDoubleTap }} testId='a' />
        <TestPressable handlers={{ onDoubleTap }} testId='b' />
      </>
    );
    const a = screen.getByTestId('a');
    const b = screen.getByTestId('b');

    pointerDown(a);
    pointerUp(a);
    await sleep(20);
    pointerDown(b);
    pointerUp(b);

    await sleep(DOUBLE_TAP_DELAY + 20);
    expect(onDoubleTap).toHaveBeenCalledTimes(0);
  });

  test('ignores a second active pointer while one is tracked', () => {
    const onTap = mock(() => {});
    render(<TestPressable handlers={{ onTap }} />);
    const el = screen.getByTestId('pressable');

    // first pointer (tracked)
    fireEvent.pointerDown(el, { button: 0, pointerId: 1, pointerType: 'mouse' });
    // second pointer (ignored by hook)
    fireEvent.pointerDown(el, { button: 0, pointerId: 2, pointerType: 'mouse' });
    fireEvent.pointerUp(el, { button: 0, pointerId: 2, pointerType: 'mouse' });
    // finish first
    fireEvent.pointerUp(el, { button: 0, pointerId: 1, pointerType: 'mouse' });

    expect(onTap).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Prop composition / mapping
// --------------------------------------------------------------------------------------

describe('usePressGestures — prop composition & mapping', () => {
  test('keeps user onDoubleClick intact when no onDoubleTap is provided', () => {
    const onDoubleClick = mock(() => {});
    render(<TestPressable handlers={{}} props={{ onDoubleClick }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    pointerDown(el);
    pointerUp(el);
    expect(onDoubleClick).toHaveBeenCalled();
  });

  test('blocks user onContextMenu when any gesture is present', () => {
    const onTap = mock(() => {});
    const ext = { onContextMenu: mock(() => {}) };
    render(<TestPressable handlers={{ onTap }} props={{ ...ext }} />);
    const el = screen.getByTestId('pressable');
    contextMenu(el);
    expect(ext.onContextMenu).toHaveBeenCalledTimes(0);
  });

  test('allows user onContextMenu when no gesture is present', () => {
    const ext = { onContextMenu: mock(() => {}) };
    render(<TestPressable handlers={{}} props={{ ...ext }} />);
    const el = screen.getByTestId('pressable');
    contextMenu(el);
    expect(ext.onContextMenu).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Timing edges
// --------------------------------------------------------------------------------------

describe('usePressGestures — timing edge cases', () => {
  test('second tap just outside the window → single tap only (defer path)', async () => {
    const onTap = mock(() => {});
    const onDoubleTap = mock(() => {});
    render(<TestPressable handlers={{ onTap, onDoubleTap }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el);
    pointerUp(el);
    await sleep(DOUBLE_TAP_DELAY + 15);
    pointerDown(el);
    pointerUp(el);
    expect(onDoubleTap).toHaveBeenCalledTimes(0);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('tap allowed after hold timer is cancelled by movement (before release)', async () => {
    const onTap = mock(() => {});
    const onHold = mock(() => {});
    render(<TestPressable handlers={{ onTap, onHold }} />);
    const el = screen.getByTestId('pressable');
    pointerDown(el, { clientX: 0, clientY: 0 });
    pointerMove(el, { clientX: MOVE_TOLERANCE_MOUSE + 1, clientY: 0 }); // cancels hold
    await sleep(30);
    pointerUp(el);
    expect(onHold).toHaveBeenCalledTimes(0);
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});

// --------------------------------------------------------------------------------------
// Hook-level shape via renderHook
// --------------------------------------------------------------------------------------

describe('usePressGestures — renderHook shape', () => {
  test('bindWithProps does not strip onClick if onTap is not provided', () => {
    const { result } = renderHook(() => usePressGestures({}));
    const onClick = mock(() => {});
    const merged = result.current.bindWithProps({ onClick });
    expect(merged.onClick).toBe(onClick);
  });

  test('bindWithProps strips onClick only when onTap is provided', () => {
    const { result } = renderHook(() => usePressGestures({ onTap: () => {} }));
    const onClick = mock(() => {});
    const merged = result.current.bindWithProps({ onClick });
    expect(merged.onClick).toBeUndefined();
  });

  test('bindWithProps strips onDoubleClick only when onDoubleTap is provided', () => {
    const { result } = renderHook(() => usePressGestures({ onDoubleTap: () => {} }));
    const onDoubleClick = mock(() => {});
    const merged = result.current.bindWithProps({ onDoubleClick });
    expect(merged.onDoubleClick).toBeUndefined();
  });

  test('when no gestures, props object is returned unchanged (keys)', () => {
    const { result } = renderHook(() => usePressGestures({}));
    const props: DivProps = { className: 'x' };
    const merged = result.current.bindWithProps(props);
    expect(Object.keys(merged).sort()).toEqual(Object.keys(props).sort());
  });
});
