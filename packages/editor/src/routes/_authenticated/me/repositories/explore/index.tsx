import { createFileRoute } from '@tanstack/react-router';
import { Explore } from '@features/me/repositories/Explore';

export const Route = createFileRoute('/_authenticated/me/repositories/explore/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Explore />;
}
