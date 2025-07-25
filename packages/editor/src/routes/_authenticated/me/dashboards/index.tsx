import { createFileRoute } from '@tanstack/react-router';
import { Dashboards } from '@features/me/dashboards/Dashboards';

export const Route = createFileRoute('/_authenticated/me/dashboards/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Dashboards />;
}
