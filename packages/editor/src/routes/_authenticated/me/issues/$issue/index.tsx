import { NotFound } from '@features/404';
import { IssuePage } from '@features/me/issues/issuePage';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/me/issues/$issue/')({
  loader: data => {
    // validate the issue is a number
    if (isNaN(Number(data.params.issue))) {
      throw notFound({
        data: {
          reason: 'issue-not-found',
        },
      });
    }
    return {
      issue: Number(data.params.issue),
    };
  },
  component: RouteComponent,
  notFoundComponent: NotFound,
});

function RouteComponent() {
  const { issue } = Route.useLoaderData();
  return <IssuePage id={issue} />;
}
