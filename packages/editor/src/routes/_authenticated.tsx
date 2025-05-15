import { createFileRoute, Outlet } from "@tanstack/react-router";
import { userQueryOptions } from "../lib/api/user";

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
  const { user } = Route.useRouteContext();
  if (!user) {
    return <Login />;
  }

  return <Outlet />;
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