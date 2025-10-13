import { createFileRoute } from '@tanstack/react-router';
import { Explore } from '@features/me/addons/Explore';

export const Route = createFileRoute('/_authenticated/me/addons/explore/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Explore />;
}
