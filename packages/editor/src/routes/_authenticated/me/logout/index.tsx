import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/me/logout/')({
  beforeLoad: () => {
    // Automatically redirect to the dashboards page
    throw redirect({
      href: '/api/logout',
      replace: true,
    });
  },
});
