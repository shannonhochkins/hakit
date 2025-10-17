import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { type QueryClient } from '@tanstack/react-query';
import { MediaQueries } from '@components/MediaQueries';
import { NotFound } from '@features/404';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
  notFoundComponent: NotFound,
});

function Root() {
  return (
    <>
      <MediaQueries />
      <Outlet />
    </>
  );
}
