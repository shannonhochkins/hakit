import { createFileRoute } from '@tanstack/react-router';
import { ComponentsManager } from './-components/ComponentsManager';

export const Route = createFileRoute('/_authenticated/me/components/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ComponentsManager />;
}
