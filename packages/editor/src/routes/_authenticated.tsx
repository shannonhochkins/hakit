import { createFileRoute, Outlet } from '@tanstack/react-router';
import { userQueryOptions } from '../services/user';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { HassConnect } from '@hakit/core';
import { useEffect } from 'react';
import { useAuthButtonState } from '@hooks/useAuthButtonState';
import { Spinner } from '@components/Spinner';
import { HassModal } from '@components/HassModal';

const Login = () => {
  const { buttonState } = useAuthButtonState();

  return (
    <div>
      <p>You need to {buttonState.type === 'sign-in' ? 'sign in' : 'create an account'} to continue</p>
      <button>
        <a href='/api/login'>Sign In</a>
      </button>
      <button>
        <a href='/api/register'>Create Account</a>
      </button>
    </div>
  );
};

const Component = () => {
  const context = Route.useRouteContext();
  const [hassUrl] = useLocalStorage<string | null>('hassUrl');
  const [hassToken] = useLocalStorage<string | undefined>('hassToken');
  const { markAccountCreated } = useAuthButtonState();

  // Mark that user has created an account when they successfully authenticate
  useEffect(() => {
    if (context.user) {
      markAccountCreated();
    }
  }, [context.user, markAccountCreated]);

  if (!context.user) {
    return <Login />;
  }

  if (!hassUrl) {
    // ask the user for their Home Assistant URL
    return <HassModal />;
  }

  return (
    <HassConnect
      loading={<Spinner absolute text='Connecting to Home Assistant' />}
      hassUrl={hassUrl}
      hassToken={hassToken}
      options={{
        renderError: error => {
          return <HassModal error={error} />;
        },
      }}
    >
      <Outlet />
    </HassConnect>
  );
};

// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    try {
      const data = await queryClient.fetchQuery(userQueryOptions);
      return data;
    } catch (e) {
      console.error('Error fetching user data', e);
      return { user: null };
    }
  },
  component: Component,
});
