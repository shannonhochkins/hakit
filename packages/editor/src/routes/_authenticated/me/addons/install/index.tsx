import { createFileRoute } from '@tanstack/react-router';
import { Install } from '@features/me/addons/Install';

export const Route = createFileRoute('/_authenticated/me/addons/install/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Install />;
}
