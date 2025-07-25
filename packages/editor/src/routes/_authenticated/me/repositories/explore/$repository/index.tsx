import { RepositoryDetail } from '@features/me/repositories/Explore/Detail';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_authenticated/me/repositories/explore/$repository/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { repository } = Route.useParams();
  return <RepositoryDetail repositoryId={repository} />;
}
