import { createFileRoute } from '@tanstack/react-router';
import { Install } from '@features/me/repositories/Install';

export const Route = createFileRoute('/_authenticated/me/repositories/install/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Install />;
}
