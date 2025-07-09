import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { type QueryClient } from '@tanstack/react-query';
interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
});

function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}
