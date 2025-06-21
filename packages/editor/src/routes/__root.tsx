import {
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useGlobalStore } from "@lib/hooks/useGlobalStore";
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
});


function Root() {
  const editorMode = useGlobalStore((state) => state.editorMode);

  useEffect(() => {
    if (editorMode) {
      document.body.classList.add('edit-mode');
    } else {
      document.body.classList.remove('edit-mode');
    }
    return () => {
      document.body.classList.remove('edit-mode');
    };
  }, [editorMode]);
  return (
    <>
      <Outlet />
    </>
  );
}