import { createFileRoute } from '@tanstack/react-router';
import { MyDashboards } from '@lib/page/me/Dashboards';

export const Route = createFileRoute('/_authenticated/me/dashboards/')({
  component: RouteComponent,
})

function RouteComponent() {
  // get the path param from /editor:/id with tanstack router
  return (
    <MyDashboards />
  );
}

