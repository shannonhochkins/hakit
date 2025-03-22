import { useLocalStorage } from './useLocalStorage';
import { useGlobalStore } from './useGlobalStore';

export function useDashboards() {
  const dashboards = useGlobalStore(store => store.puckPageData.root.props?.dashboards);
  const [currentId] = useLocalStorage<string | null>('id', null);
  return dashboards
    ? dashboards.map(page => ({
        title: page.title,
        id: page.id,
        active: page.id === currentId,
      }))
    : [];
}
