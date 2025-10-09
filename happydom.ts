import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// Ensure requestAnimationFrame exists for libraries that rely on it during tests
declare global {
  interface Window {
    requestAnimationFrame?: (cb: FrameRequestCallback) => number;
  }
}

const globalWindow: Window = globalThis as unknown as Window;
if (typeof globalWindow.requestAnimationFrame !== 'function') {
  globalWindow.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number;
}

// Ensure window.history and its methods exist for react-use/useLocation
// react-use tries to patch history methods, so they must exist before import
if (!globalWindow.history) {
  // Create a minimal history object if it doesn't exist
  // @ts-expect-error - Creating minimal history for test environment
  globalWindow.history = {
    length: 0,
    scrollRestoration: 'auto',
    state: null,
    pushState: function () {},
    replaceState: function () {},
    go: function () {},
    back: function () {},
    forward: function () {},
  };
} else {
  // Ensure critical methods exist on existing history object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const history = globalWindow.history as any;
  if (!history.pushState) {
    history.pushState = function () {};
  }
  if (!history.replaceState) {
    history.replaceState = function () {};
  }
  if (!history.go) {
    history.go = function () {};
  }
  if (!history.back) {
    history.back = function () {};
  }
  if (!history.forward) {
    history.forward = function () {};
  }
}
