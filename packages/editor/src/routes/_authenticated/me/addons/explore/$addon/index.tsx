import { AddonDetail } from '@features/me/addons/Explore/Detail';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_authenticated/me/addons/explore/$addon/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { addon } = Route.useParams();
  return <AddonDetail addonId={addon} />;
}
