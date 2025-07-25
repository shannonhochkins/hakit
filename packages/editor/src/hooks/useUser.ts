import { useRouteContext } from '@tanstack/react-router';

export function useUser() {
  const context = useRouteContext({
    from: '/_authenticated',
  });
  return context.user;
}
