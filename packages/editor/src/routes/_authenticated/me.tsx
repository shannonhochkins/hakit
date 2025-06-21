import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Layout } from '../../lib/page/me/shared/Layout';

export const Route = createFileRoute('/_authenticated/me')({
  component: MeLayout,
});

function MeLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}