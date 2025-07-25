import { createFileRoute } from '@tanstack/react-router';
import { RepositoriesManager } from '@features/me/repositories/RepositoriesManager';

export const Route = createFileRoute('/_authenticated/me/repositories/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RepositoriesManager />;
}
