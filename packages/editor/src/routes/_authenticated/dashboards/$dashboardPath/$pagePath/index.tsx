import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@client/src/lib/Dashboard';
import { Renderer } from '@editor/puck/Renderer';
import { useEffect } from 'react';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import createCache from '@emotion/cache';

export const Route = createFileRoute(
  '/_authenticated/dashboards/$dashboardPath/$pagePath/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  useEffect(() => {
    setEmotionCache(createCache({
      key: 'hakit-addons',
      container: document.head,
    }));
  }, []);

  return <Dashboard dashboardPath={params.dashboardPath}>
    <Renderer />
  </Dashboard>;
}