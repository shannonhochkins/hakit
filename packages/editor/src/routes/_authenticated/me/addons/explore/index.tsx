import { createFileRoute } from '@tanstack/react-router';
import { Explore } from '@features/me/addons/Explore';
import { NotFound } from '@features/404';

export const Route = createFileRoute('/_authenticated/me/addons/explore/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
});

function RouteComponent() {
  return <Explore />;
}
