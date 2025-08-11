import { IssuePage } from '@features/me/issues/issuePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/me/issues/$issue/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const id = Number(params.issue);
  return <IssuePage id={id} />;
}
