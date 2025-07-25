import { useQuery } from '@tanstack/react-query';
import { userQueryOptions } from '@services/user';
import { useLocalStorage } from './useLocalStorage';
import { useMemo } from 'react';

export type AuthButtonState =
  | { type: 'get-started'; label: 'Get Started' }
  | { type: 'sign-in'; label: 'Sign In' }
  | { type: 'dashboard'; label: 'My Dashboards' };

/**
 * Custom hook to determine the appropriate header button state based on authentication
 * and user history. This provides a smooth UX by showing contextually relevant actions.
 */
export function useAuthButtonState(): {
  buttonState: AuthButtonState;
  isLoading: boolean;
  markAccountCreated: () => void;
} {
  const userQuery = useQuery(userQueryOptions);
  const [hasCreatedAccount, setHasCreatedAccount] = useLocalStorage<boolean>('hasCreatedAccount', false);

  const buttonState: AuthButtonState = useMemo(() => {
    // If user is authenticated, show dashboard button
    if (userQuery.data?.user) {
      return {
        type: 'dashboard',
        label: 'My Dashboards',
      };
    }

    // If user has previously created an account but isn't signed in, show sign in
    if (hasCreatedAccount) {
      return {
        type: 'sign-in',
        label: 'Sign In',
      };
    }

    // Default: new user, show get started (register)
    return {
      type: 'get-started',
      label: 'Get Started',
    };
  }, [userQuery.data?.user, hasCreatedAccount]);

  const markAccountCreated = () => {
    setHasCreatedAccount(true);
  };

  return {
    buttonState,
    isLoading: userQuery.isLoading,
    markAccountCreated,
  };
}
