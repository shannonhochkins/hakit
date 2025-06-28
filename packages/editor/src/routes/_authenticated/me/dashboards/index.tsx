import { createFileRoute } from '@tanstack/react-router';
import { Dashboards } from '@client/src/routes/_authenticated/me/dashboards/-components/Dashboards';

export const Route = createFileRoute('/_authenticated/me/dashboards/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  return <Dashboards />;
}
