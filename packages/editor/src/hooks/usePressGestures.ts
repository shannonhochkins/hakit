import { useRef, useCallback } from 'react';
import type {
  ComponentProps,
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEventHandler,
  PointerEventHandler,
  KeyboardEventHandler,
  FocusEventHandler,
} from 'react';

/** Tunables (outside the hook) */
export const DOUBLE_TAP_DELAY = 280;
export const HOLD_DELAY = 500;
export const MOVE_TOLERANCE_MOUSE = 6;
export const MOVE_TOLERANCE_TOUCH = 14;

type DivProps = ComponentProps<'div'>;

export type PressHandlers = {
  onTap?: (e: ReactPointerEvent<HTMLDivElement> | ReactKeyboardEvent<HTMLDivElement>) => void;
  /** If provided, we can fire tap immediately and call onTapCancel if a second tap arrives. */
  onTapCancel?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDoubleTap?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onHold?: (e: ReactPointerEvent<HTMLDivElement>) => void;
};

export type PressGestureOptions = {
  holdDelay?: number;
  doubleTapDelay?: number;
};

export function usePressGestures(handlers: PressHandlers, options?: PressGestureOptions) {
  const holdDelay = options?.holdDelay ?? HOLD_DELAY;
  const doubleTapDelay = options?.doubleTapDelay ?? DOUBLE_TAP_DELAY;
  const state = useRef<{
    pointerId: number | null;
    pointerType: 'mouse' | 'touch' | 'pen' | null;
    downX: number;
    downY: number;
    moved: boolean;
    pressed: boolean;
    firedHold: boolean;
    holdTimer: number | null;
    pendingTapTimer: number | null;
    lastTapTime: number;
    lastTapTarget: HTMLDivElement | null;
    lastTapWasImmediate: boolean;
    lastTapCleanupTimer: number | null;
  }>({
    pointerId: null,
    pointerType: null,
    downX: 0,
    downY: 0,
    moved: false,
    pressed: false,
    firedHold: false,
    holdTimer: null,
    pendingTapTimer: null,
    lastTapTime: 0,
    lastTapTarget: null,
    lastTapWasImmediate: false,
    lastTapCleanupTimer: null,
  });

  const mappedClicksRef = useRef<{
    onClick?: MouseEventHandler<HTMLDivElement>;
    onDoubleClick?: MouseEventHandler<HTMLDivElement>;
  }>({});

  /** Small helpers */
  const clearHold = useCallback(() => {
    if (state.current.holdTimer !== null) {
      window.clearTimeout(state.current.holdTimer);
      state.current.holdTimer = null;
    }
  }, []);

  const clearPendingTap = useCallback(() => {
    if (state.current.pendingTapTimer !== null) {
      window.clearTimeout(state.current.pendingTapTimer);
      state.current.pendingTapTimer = null;
    }
  }, []);

  const clearLastTapCleanup = useCallback(() => {
    if (state.current.lastTapCleanupTimer !== null) {
      window.clearTimeout(state.current.lastTapCleanupTimer);
      state.current.lastTapCleanupTimer = null;
    }
  }, []);

  const resetState = useCallback(
    (target?: HTMLDivElement, pointerId?: number) => {
      clearHold();
      if (pointerId != null && target) {
        try {
          target.releasePointerCapture(pointerId);
        } catch {
          /* ignore */
        }
      }
      state.current.pointerId = null;
      state.current.pointerType = null;
      state.current.moved = false;
      state.current.pressed = false;
      state.current.firedHold = false;
    },
    [clearHold]
  );

  const cancelAll = useCallback(
    (target?: HTMLDivElement, pointerId?: number) => {
      clearHold();
      clearPendingTap();
      clearLastTapCleanup();
      if (pointerId != null && target) {
        try {
          target.releasePointerCapture(pointerId);
        } catch {
          /* ignore */
        }
      }
      state.current.pointerId = null;
      state.current.pointerType = null;
      state.current.moved = false;
      state.current.pressed = false;
      state.current.firedHold = false;
      state.current.lastTapTime = 0;
      state.current.lastTapTarget = null;
      state.current.lastTapWasImmediate = false;
    },
    [clearHold, clearPendingTap, clearLastTapCleanup]
  );

  /** Derived flags — used to completely skip logic when not needed */
  const hasTap = !!handlers.onTap;
  const hasDouble = !!handlers.onDoubleTap;
  const hasHold = !!handlers.onHold;
  const hasCancel = !!handlers.onTapCancel;

  /** Internal handlers (each is a no-op if not needed) */

  const onPointerDown: PointerEventHandler<HTMLDivElement> = e => {
    if (!(hasTap || hasHold || hasDouble)) return;
    if (e.button !== 0) return;
    if (state.current.pointerId !== null) return;

    state.current.pointerId = e.pointerId;
    state.current.pointerType = e.pointerType as 'mouse' | 'touch' | 'pen';
    state.current.downX = e.clientX;
    state.current.downY = e.clientY;
    state.current.moved = false;
    state.current.pressed = true;
    state.current.firedHold = false;

    // Only capture pointer and start hold timer when hold/double is used
    if (hasHold || hasDouble) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    if (hasHold) {
      state.current.holdTimer = window.setTimeout(() => {
        if (state.current.moved || !state.current.pressed) return;
        state.current.firedHold = true;
        clearPendingTap();
        handlers.onHold?.(e);
      }, holdDelay);
    }
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = e => {
    if (!(hasHold || hasDouble)) return;
    if (state.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - state.current.downX;
    const dy = e.clientY - state.current.downY;
    const tol = state.current.pointerType === 'touch' ? MOVE_TOLERANCE_TOUCH : MOVE_TOLERANCE_MOUSE;

    if (!state.current.moved && (Math.abs(dx) > tol || Math.abs(dy) > tol)) {
      state.current.moved = true;
      if (hasHold) clearHold();
    }
  };

  const fireImmediateTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasTap) return;
    handlers.onTap?.(e);
    // only forward onClick if user passed one AND we handle tap
    mappedClicksRef.current.onClick?.(e);

    if (hasDouble) {
      // prepare for possible second tap within window
      clearLastTapCleanup();
      state.current.lastTapTime = performance.now();
      state.current.lastTapTarget = e.currentTarget;
      state.current.lastTapWasImmediate = true;
      state.current.lastTapCleanupTimer = window.setTimeout(() => {
        state.current.lastTapTime = 0;
        state.current.lastTapTarget = null;
        state.current.lastTapWasImmediate = false;
        state.current.lastTapCleanupTimer = null;
      }, doubleTapDelay);
    }
  };

  // replace your onPointerUp with this:
  const onPointerUp: PointerEventHandler<HTMLDivElement> = e => {
    // Fast path: only tap is provided → emit immediately, but respect pointer tracking to ignore other active pointers.
    if (hasTap && !hasDouble && !hasHold) {
      if (e.button === 0) {
        if (state.current.pointerId === null || state.current.pointerId === e.pointerId) {
          fireImmediateTap(e);
        }
      }
      resetState(e.currentTarget, e.pointerId);
      return;
    }

    if (!(hasTap || hasDouble || hasHold)) return;

    // If we were tracking for hold/double, ensure we're handling the same pointer
    if ((hasHold || hasDouble) && state.current.pointerId !== e.pointerId) return;

    clearHold();

    // Ignore if gesture was cancelled (released without press) or hold already fired
    if ((hasHold || hasDouble) && (state.current.firedHold || !state.current.pressed)) {
      resetState(e.currentTarget, e.pointerId);
      return;
    }

    // --- double-tap flow ---
    if (hasDouble) {
      const now = performance.now();
      const sameTarget = state.current.lastTapTarget === e.currentTarget;
      const sinceLast = now - state.current.lastTapTime;
      const withinDoubleConfigured = sinceLast > 0 && sinceLast <= doubleTapDelay && sameTarget;

      if (withinDoubleConfigured) {
        if (state.current.lastTapWasImmediate) {
          if (hasCancel) handlers.onTapCancel?.(e);
          else clearPendingTap();
        } else {
          clearPendingTap();
        }

        handlers.onDoubleTap?.(e);
        mappedClicksRef.current.onDoubleClick?.(e);

        clearLastTapCleanup();
        state.current.lastTapTime = 0;
        state.current.lastTapTarget = null;
        state.current.lastTapWasImmediate = false;

        resetState(e.currentTarget, e.pointerId);
        return;
      }

      // first tap in sequence
      if (hasTap && hasCancel) {
        fireImmediateTap(e); // immediate-then-cancel path
      } else if (hasTap && !hasCancel) {
        // defer single tap so only one fires if a second tap arrives
        state.current.lastTapTime = now;
        state.current.lastTapTarget = e.currentTarget;
        state.current.pendingTapTimer = window.setTimeout(() => {
          handlers.onTap?.(e);
          mappedClicksRef.current.onClick?.(e);
          state.current.pendingTapTimer = null;
          state.current.lastTapTime = 0;
          state.current.lastTapTarget = null;
        }, doubleTapDelay);
      } else {
        // hasDouble but no tap → just mark the first tap time/target
        state.current.lastTapTime = now;
        state.current.lastTapTarget = e.currentTarget;
      }

      resetState(e.currentTarget, e.pointerId);
      return;
    }

    // --- tap (with hold but no double) ---
    // At this point firedHold is false (guarded above), so safe to emit tap.
    if (hasTap && e.button === 0) fireImmediateTap(e);
    resetState(e.currentTarget, e.pointerId);
  };

  const onPointerCancel: PointerEventHandler<HTMLDivElement> = e => {
    if (!(hasTap || hasDouble || hasHold)) return;
    if (state.current.pointerId !== null && e.pointerId === state.current.pointerId) {
      cancelAll(e.currentTarget, e.pointerId);
    }
  };

  const onPointerLeave: PointerEventHandler<HTMLDivElement> = e => {
    if (!(hasTap || hasDouble || hasHold)) return;
    if (state.current.pointerId !== null && e.pointerId === state.current.pointerId) {
      clearHold();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      state.current.pointerId = null;
      state.current.pointerType = null;
      state.current.moved = false;
      state.current.pressed = false;
      state.current.firedHold = false;
    }
  };

  // Keyboard maps Enter/Space to tap (only if onTap exists)
  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
    if (!hasTap) return;
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
  };
  const onKeyUp: KeyboardEventHandler<HTMLDivElement> = e => {
    if (!hasTap) return;
    if (e.key === 'Enter' || e.key === ' ') handlers.onTap?.(e);
  };

  const onContextMenu: MouseEventHandler<HTMLDivElement> = e => {
    // Only block the long-press callout if we actually care about press gestures.
    if (hasHold || hasDouble || hasTap) e.preventDefault();
  };

  const onBlur: FocusEventHandler<HTMLDivElement> = () => {
    if (!(hasTap || hasDouble || hasHold)) return;
    clearHold();
    state.current.pressed = false;
  };

  /** Compose helpers (no `any`) */
  function composePointer(
    internal: PointerEventHandler<HTMLDivElement> | undefined,
    external: PointerEventHandler<HTMLDivElement> | undefined
  ): PointerEventHandler<HTMLDivElement> | undefined {
    if (!internal) return external;
    if (!external) return internal;
    return e => {
      internal(e);
      if (!e.defaultPrevented) external(e);
    };
  }
  function composeMouse(
    internal: MouseEventHandler<HTMLDivElement> | undefined,
    external: MouseEventHandler<HTMLDivElement> | undefined
  ): MouseEventHandler<HTMLDivElement> | undefined {
    if (!internal) return external;
    if (!external) return internal;
    return e => {
      internal(e);
      if (!e.defaultPrevented) external(e);
    };
  }
  function composeKeyboard(
    internal: KeyboardEventHandler<HTMLDivElement> | undefined,
    external: KeyboardEventHandler<HTMLDivElement> | undefined
  ): KeyboardEventHandler<HTMLDivElement> | undefined {
    if (!internal) return external;
    if (!external) return internal;
    return e => {
      internal(e);
      if (!e.defaultPrevented) external(e);
    };
  }
  function composeFocus(
    internal: FocusEventHandler<HTMLDivElement> | undefined,
    external: FocusEventHandler<HTMLDivElement> | undefined
  ): FocusEventHandler<HTMLDivElement> | undefined {
    if (!internal) return external;
    if (!external) return internal;
    return e => {
      internal(e);
      if (!e.defaultPrevented) external(e);
    };
  }

  /** Single-surface API */
  function bindWithProps(userProps: DivProps): DivProps {
    // If no gestures are requested at all, return props untouched.
    if (!hasTap && !hasDouble && !hasHold) {
      // Special case: enable native-like dblclick behavior for pointer sequences
      // when user supplied onDoubleClick but no gestures are requested.
      let onPointerUpNoGestures: PointerEventHandler<HTMLDivElement> | undefined;
      if (userProps.onDoubleClick) {
        mappedClicksRef.current.onDoubleClick = userProps.onDoubleClick;
        const prev = onPointerUpNoGestures;
        onPointerUpNoGestures = e => {
          if (prev) prev(e);
          if (e.button !== 0) return;
          const now = performance.now();
          const sameTarget = state.current.lastTapTarget === e.currentTarget;
          const sinceLast = now - state.current.lastTapTime;
          const within = sinceLast > 0 && sinceLast <= doubleTapDelay && sameTarget;
          if (within) {
            mappedClicksRef.current.onDoubleClick?.(e);
            state.current.lastTapTime = 0;
            state.current.lastTapTarget = null;
            return;
          }
          state.current.lastTapTime = now;
          state.current.lastTapTarget = e.currentTarget;
        };
      }

      if (onPointerUpNoGestures) {
        return {
          ...userProps,
          onPointerUp: composePointer(onPointerUpNoGestures, userProps.onPointerUp),
        };
      }
      return userProps;
    }

    // Capture user's click handlers only if we handle the corresponding gesture.
    mappedClicksRef.current.onClick = hasTap ? userProps.onClick : undefined;
    mappedClicksRef.current.onDoubleClick = hasDouble ? userProps.onDoubleClick : undefined;

    return {
      ...userProps,
      onPointerDown: composePointer(hasTap || hasHold || hasDouble ? onPointerDown : undefined, userProps.onPointerDown),
      onPointerMove: composePointer(hasHold || hasDouble ? onPointerMove : undefined, userProps.onPointerMove),
      onPointerUp: composePointer(onPointerUp, userProps.onPointerUp),
      onPointerCancel: composePointer(onPointerCancel, userProps.onPointerCancel),
      onPointerLeave: composePointer(onPointerLeave, userProps.onPointerLeave),

      onContextMenu: composeMouse(onContextMenu, userProps.onContextMenu),
      onKeyDown: composeKeyboard(hasTap ? onKeyDown : undefined, userProps.onKeyDown),
      onKeyUp: composeKeyboard(hasTap ? onKeyUp : undefined, userProps.onKeyUp),
      onBlur: composeFocus(onBlur, userProps.onBlur),

      // Only remove DOM click handlers if we’re handling that gesture here.
      ...(hasTap ? { onClick: undefined } : null),
      ...(hasDouble ? { onDoubleClick: undefined } : null),
    };
  }

  return { bindWithProps };
}
