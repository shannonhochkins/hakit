import { createFileRoute } from '@tanstack/react-router';
import { Renderer } from '@features/dashboard/Renderer';
// import { useEffect } from 'react';
// import { useGlobalStore } from '@hooks/useGlobalStore';
// import createCache from '@emotion/cache';
import { PuckPreload } from '@features/dashboard/PuckPreload';
import { AssignPuckData } from '@features/dashboard/PuckAssignData';

export const Route = createFileRoute('/_authenticated/dashboard/$dashboardPath/$pagePath/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  const params = Route.useParams();
  // const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  // useEffect(() => {
  //   setEmotionCache(
  //     createCache({
  //       key: 'hakit-editor',
  //       container: document.head,
  //     })
  //   );
  // }, [setEmotionCache]);

  return (
    <PuckPreload dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
      <AssignPuckData dashboardPath={params.dashboardPath} pagePath={params.pagePath}>
        <Renderer />
      </AssignPuckData>
    </PuckPreload>
  );
}
