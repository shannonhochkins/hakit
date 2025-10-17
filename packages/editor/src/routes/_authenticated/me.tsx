import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Layout } from '@features/me/Layout';
import { NotFound } from '@features/404';

export const Route = createFileRoute('/_authenticated/me')({
  component: MeLayout,
  notFoundComponent: NotFound,
});

function MeLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
