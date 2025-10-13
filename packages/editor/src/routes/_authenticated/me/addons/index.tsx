import { createFileRoute } from '@tanstack/react-router';
import { AddonsManager } from '@features/me/addons/AddonsManager';

export const Route = createFileRoute('/_authenticated/me/addons/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AddonsManager />;
}
