import { Styleguide } from '@features/styleguide';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/me/styleguide/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Styleguide />;
}
