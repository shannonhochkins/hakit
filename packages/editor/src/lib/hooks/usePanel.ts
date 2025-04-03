import { useLocalStorage } from './useLocalStorage';

export type Panel = 'components' | 'tree' | 'options' | 'background';

export function usePanel() {
  const [panel, setPanel] = useLocalStorage<Panel>('panel', 'options');
  return [panel, setPanel] as const;
}
