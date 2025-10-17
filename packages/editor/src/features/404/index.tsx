import { NotFoundRouteProps } from '@tanstack/react-router';

import { ArrowLeftIcon, HomeIcon, LayoutDashboard } from 'lucide-react';
import styles from './404.module.css';
import { router } from '../../router';
import { PrimaryButton, SecondaryButton } from '@components/Button';

const MESSAGE_BY_REASON = {
  'dashboard-not-found': 'Dashboard not found.',
  'dashboard-has-no-pages': 'Dashboard has no pages.',
  'page-not-found': 'Dashboard page not found.',
  'not-found': 'Page Not found.',
  'issue-not-found': 'Issue not found.',
};

const DESCRIPTION_BY_REASON = {
  'dashboard-not-found': 'The dashboard "{dashboardPath}" does not exist.',
  'dashboard-has-no-pages': 'The dashboard you are looking for has no pages.',
  'page-not-found': 'The page "{pagePath}" does not exist in the dashboard "{dashboardPath}".',
  'not-found': "The page you're looking for doesn't exist or has been moved.",
  'issue-not-found': 'The issue you are looking for does not exist.',
} as const;

export const NotFound = (props: NotFoundRouteProps) => {
  // const navigate = useNavigate();
  const handleGoBack = () => {
    if (router.history.canGoBack()) {
      router.history.back();
    }
  };
  const handleGoToHomepage = () => {
    router.navigate({ to: '/' });
  };
  const handleGoToAdminPortal = () => {
    router.navigate({ to: '/me' });
  };
  const data = (props as NotFoundRouteProps)?.data as {
    data?: {
      reason?: keyof typeof MESSAGE_BY_REASON;
      dashboardPath?: string;
      pagePath?: string;
    };
  };
  const reason = data?.data?.reason ?? 'not-found';
  const dashboardPath = data?.data?.dashboardPath ?? '';
  const pagePath = data?.data?.pagePath ?? '';
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Error information */}
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <span className={styles.errorCode}>404</span>
            </div>
            <h1 className={styles.errorTitle}>
              {MESSAGE_BY_REASON[reason]
                .replace('"{dashboardPath}"', dashboardPath ? `"${dashboardPath}"` : '')
                .replace('"{pagePath}"', pagePath ? `"${pagePath}"` : '')}
            </h1>
            <p className={styles.errorMessage}>
              {DESCRIPTION_BY_REASON[reason]
                .replace('"{dashboardPath}"', dashboardPath ? `"${dashboardPath}"` : '')
                .replace('"{pagePath}"', pagePath ? `"${pagePath}"` : '')}
            </p>
          </div>
          {/* Action buttons */}
          <div className={styles.actionButtons}>
            <SecondaryButton size='lg' aria-label='Go to Homepage' startIcon={<HomeIcon size={18} />} onClick={handleGoToHomepage}>
              Homepage
            </SecondaryButton>
            <PrimaryButton
              size='lg'
              aria-label='Go to Admin Portal'
              startIcon={<LayoutDashboard size={18} />}
              onClick={handleGoToAdminPortal}
            >
              Admin Portal
            </PrimaryButton>
          </div>
          {/* Back button */}
          {router.history.canGoBack() && (
            <SecondaryButton aria-label='Go Back' startIcon={<ArrowLeftIcon size={18} />} onClick={handleGoBack}>
              Go Back
            </SecondaryButton>
          )}
        </div>
      </main>
      {/* Background effects */}
      <div className={styles.bgEffect1}></div>
      <div className={styles.bgEffect2}></div>
    </div>
  );
};
