import { createFileRoute, Outlet } from "@tanstack/react-router";
import { userQueryOptions } from "../lib/api/user";
import { useLocalStorage } from "@lib/hooks/useLocalStorage";
// TODO - move this to a better place
import { HassModal } from '@lib/components/Dashboard/HassModal';
import { HassConnect } from "@hakit/core";


const Login = () => {
  return (
    <div>
      <p>You have to login or register</p>
      <button>
        <a href="/api/login">Login!</a>
      </button>
      <button>
        <a href="/api/register">Register!</a>
      </button>
    </div>
  );
};

const Component = () => {
  const context = Route.useRouteContext();
  const [hassUrl] = useLocalStorage<string | null>('hassUrl');
  const [hassToken] = useLocalStorage<string | undefined>('hassToken');
  if (!context.user) {
    return <Login />;
  }

  if (!hassUrl) {
    // ask the user for their Home Assistant URL
    return <HassModal />
  }

  return <HassConnect hassUrl={hassUrl} hassToken={hassToken}>
    <Outlet />
  </HassConnect>
};

// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    try {
      const data = await queryClient.fetchQuery(userQueryOptions);
      return data;
    } catch (e) {
      console.error("Error fetching user data", e);
      return { user: null };
    }
  },
  component: Component,
});