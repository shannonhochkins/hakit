import { Column } from '@hakit/components';
import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/styleguide/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Column alignItems='flex-start' justifyContent='flex-start'>
      <Link to='/styleguide/forms'>Forms</Link>
    </Column>
  );
}
