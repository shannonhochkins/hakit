import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@lib/components/Dashboard';
import { Renderer } from '@lib/components/Renderer';
import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import createCache from '@emotion/cache';

export const Route = createFileRoute(
  '/_authenticated/me/$dashboardPath/$pagePath/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  useEffect(() => {
    setEmotionCache(createCache({
      key: 'hakit-editor',
      container: document.head,
    }));
  }, [setEmotionCache]);

  return <Dashboard dashboardPath={params.dashboardPath}>
    <Renderer />
  </Dashboard>;
}