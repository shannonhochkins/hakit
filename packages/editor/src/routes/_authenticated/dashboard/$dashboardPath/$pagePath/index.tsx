import { createFileRoute } from '@tanstack/react-router';
import { Renderer } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/Renderer';
import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import createCache from '@emotion/cache';
import { PreloadPuck } from './-components/PreloadPuck';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  useEffect(() => {
    setEmotionCache(
      createCache({
        key: 'hakit-editor',
        container: document.head,
      })
    );
  }, [setEmotionCache]);

  return (
    <PreloadPuck dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
      <Renderer />
    </PreloadPuck>
  );
}
