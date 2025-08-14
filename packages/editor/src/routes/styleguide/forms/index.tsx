import { StyleguideForms } from '@features/styleguide/forms';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/styleguide/forms/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <StyleguideForms />;
}
