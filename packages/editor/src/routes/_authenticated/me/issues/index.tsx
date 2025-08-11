import { Issues } from '@features/me/issues';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/me/issues/')({
  validateSearch: (search: Record<string, unknown>) => ({ modal: (search.modal as string) || undefined }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Issues />;
}
