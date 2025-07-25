import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/me/')({
  beforeLoad: () => {
    // Automatically redirect to the dashboards page
    throw redirect({
      to: '/me/dashboards',
      replace: true,
    });
  },
});
