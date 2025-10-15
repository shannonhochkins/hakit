import { createRouter } from '@tanstack/react-router';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { queryClient } from './queryClient';

// Create a new router instance
export const router = createRouter({ routeTree, context: { queryClient } });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
