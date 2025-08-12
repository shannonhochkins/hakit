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
