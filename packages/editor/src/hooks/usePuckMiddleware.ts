import { OnAction } from '@measured/puck';
import { create } from 'zustand';
// as onAction doesn't expose "dispatch", we need to "emit" the same actions so we can tap into them via a subscription

interface PuckMiddlewareStore {
  listeners: Array<(action: Parameters<OnAction>[0], appState: Parameters<OnAction>[1], prevState: Parameters<OnAction>[1]) => void>;
  // on action, should essentiall by written like usePuckMiddleware.getState().onAction((action, appState, prevState) => void)
  onAction: (
    listener: (action: Parameters<OnAction>[0], appState: Parameters<OnAction>[1], prevState: Parameters<OnAction>[1]) => void
  ) => void;
  emitAction: (action: Parameters<OnAction>[0], appState: Parameters<OnAction>[1], prevState: Parameters<OnAction>[1]) => void;
}

export const usePuckMiddleware = create<PuckMiddlewareStore>()((set, get) => ({
  listeners: [],
  onAction: listener => {
    set(state => ({
      listeners: [...state.listeners, listener],
    }));
  },
  emitAction: (action, appState, prevState) => {
    // notify all listeners
    get().listeners.forEach(listener => listener(action, appState, prevState));
  },
}));
