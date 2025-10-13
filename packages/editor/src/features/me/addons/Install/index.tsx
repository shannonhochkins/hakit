import { useNavigate } from '@tanstack/react-router';

import { useState, useEffect, useRef } from 'react';
import {
  GitBranchIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  CheckIcon,
  ArrowLeftIcon,
  PlusIcon,
  RefreshCcwDot,
} from 'lucide-react';
import { PrimaryButton } from '@components/Button/Primary';
import { InputField } from '@components/Form/Field/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { installAddonFromGithub, userAddonsQueryOptions } from '@services/addons';
import { Row } from '@components/Layout';
import { SecondaryButton } from '@components/Button';
import { Alert } from '@components/Alert';
import styles from './Install.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Install', styles);

interface InstallationStatus {
  status: 'idle' | 'installing' | 'complete' | 'error' | 'already-installed';
  message: string;
  logs: Array<{ id: string; message: string; status: 'success' | 'warning' | 'error'; timestamp: Date }>;
}

// CSS Modules equivalents handled via getClassName

// Helper function to get the icon for a individual log entry
const getLogStatusIcon = (status: 'success' | 'warning' | 'error') => {
  switch (status) {
    case 'success':
      return <CheckCircleIcon size={14} color='#00d26a' />;
    case 'warning':
      return <AlertCircleIcon size={14} color='#f0883e' />;
    case 'error':
      return <AlertCircleIcon size={14} color='#f85149' />;
  }
};

export function Install() {
  const [url, setUrl] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>({
    status: 'idle',
    message: '',
    logs: [],
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logsScrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs are updated
  useEffect(() => {
    if (logsScrollAreaRef.current) {
      logsScrollAreaRef.current.scrollTop = logsScrollAreaRef.current.scrollHeight;
    }
  }, [installationStatus.logs]);

  const handleToInstalledComponents = () => {
    navigate({
      to: '/me/addons',
    });
  };

  // Mutation for installing addon from GitHub with streaming
  const installAddonMutation = useMutation({
    mutationFn: async (repositoryUrl: string) => {
      // Reset status and start installation
      setInstallationStatus({
        status: 'installing',
        message: 'Starting installation...',
        logs: [],
      });
      setShowAlert(false);

      return installAddonFromGithub(repositoryUrl, progress => {
        setInstallationStatus(prev => {
          const newLogs = [
            ...prev.logs,
            {
              id: Date.now().toString() + Math.random().toString(),
              message: progress.message,
              status: progress.status,
              timestamp: new Date(),
            },
          ];

          // Check if this message indicates already installed during streaming
          const isAlreadyInstalled = progress.message.toLowerCase().includes('already installed');

          return {
            ...prev,
            message: progress.message,
            logs: newLogs,
            // If we detect "already installed" during streaming, mark it immediately
            ...(isAlreadyInstalled && { status: 'already-installed' }),
          };
        });
      });
    },
    onSuccess: () => {
      // Refresh user addons
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });

      // Only set to complete if not already marked as already-installed during streaming
      setInstallationStatus(prev => {
        if (prev.status === 'already-installed') {
          return {
            ...prev,
            message: 'Addon already installed',
          };
        }

        return {
          ...prev,
          status: 'complete',
          message: 'Installation completed successfully!',
        };
      });
      setShowAlert(true);
    },
    onError: (error: Error) => {
      setInstallationStatus(prev => {
        // Check if the last log entry already contains this error message
        const lastLog = prev.logs[prev.logs.length - 1];
        const errorMessage = error.message;

        // If the last log is an error with the same message, don't add duplicate
        if (lastLog && lastLog.status === 'error' && lastLog.message.includes(errorMessage)) {
          return {
            ...prev,
            status: 'error',
            message: 'Installation failed',
          };
        }

        // Otherwise, add the error log
        return {
          ...prev,
          status: 'error',
          message: 'Installation failed',
          logs: [
            ...prev.logs,
            {
              id: Date.now().toString() + Math.random().toString(),
              message: errorMessage,
              status: 'error' as const,
              timestamp: new Date(),
            },
          ],
        };
      });
      setShowAlert(true);
    },
  });

  const handleInstall = () => {
    if (!url.trim()) return;

    // Reset the mutation state before starting a new installation
    installAddonMutation.reset();

    installAddonMutation.mutate(url);
  };

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>{'Install Addons'}</h1>
            <p className={getClassName('pageSubtitle')}>Install new Addons & component(s) from GitHub</p>
          </div>
          <PrimaryButton
            aria-label={url.trim() ? 'Install addon' : 'Provide repository URL'}
            disabled={!url.trim()}
            onClick={handleInstall}
            startIcon={<PlusIcon size={16} />}
          >
            Install Addon
          </PrimaryButton>
        </Row>
      </div>
      {installationStatus.status === 'idle' ? (
        <>
          <InputField
            id='addon-url'
            type='text'
            name='addon-url'
            label='Repository URL'
            placeholder='https://github.com/username/repository'
            value={url}
            onChange={e => setUrl(e.target.value)}
            size='small'
            helperText='Enter the URL of a compatible HAKIT component repository. The system will validate and install the components.'
            startAdornment={<GitBranchIcon size={16} />}
          />

          <Alert title='Important Information' severity='warning'>
            <div className={getClassName('important')}>
              <code className={getClassName('importantBlock')}>
                <ArrowRightIcon size={16} />
                Only install addons from trusted sources.
              </code>
              <code className={getClassName('importantBlock')}>
                <ArrowRightIcon size={16} />
                Custom addons must follow the HAKIT component structure.
              </code>
              <code className={getClassName('importantBlock')}>
                <ArrowRightIcon size={16} />
                Installation may take several minutes to complete.
              </code>
            </div>
          </Alert>
        </>
      ) : (
        <>
          <div className={getClassName('logContainer')}>
            <div className={getClassName('logTitle')}>Installation Log</div>
            <div className={getClassName('logScrollArea')} ref={logsScrollAreaRef}>
              <div className={getClassName('logContent')}>
                {installationStatus.logs.map(log => (
                  <div className={getClassName('logEntry')} key={log.id}>
                    <div className={getClassName('logIcon')}>{getLogStatusIcon(log.status)}</div>
                    <div className={getClassName('logDetails')}>
                      <div
                        className={getClassName(
                          {
                            ['statusError']: log.status === 'error',
                            ['statusWarning']: log.status === 'warning',
                            ['statusSuccess']: log.status === 'success',
                          },
                          getClassName('logMessage')
                        )}
                      >
                        {log.message}
                      </div>
                      <div className={getClassName('logTimestamp')}>{log.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {installationStatus.logs.length === 0 && <div className={getClassName('logEmpty')}>No logs available</div>}
              </div>
            </div>
          </div>

          {showAlert && (
            <Alert
              title={installationStatus.message}
              severity={
                installationStatus.status === 'error' ? 'error' : installationStatus.status === 'already-installed' ? 'warning' : 'success'
              }
            >
              {installationStatus.status === 'installing' && (
                <p className={getClassName('description')}>Please wait while the addon is being installed. This may take a few moments.</p>
              )}
              {installationStatus.status === 'error' && (
                <p className={getClassName('description')}>
                  An error occurred during installation. Please check the logs below for details.
                </p>
              )}
              {installationStatus.status === 'complete' && (
                <p className={getClassName('description')}>
                  The addon has been successfully installed. You can now use the components in your dashboard.
                </p>
              )}
              {installationStatus.status === 'already-installed' && (
                <p className={getClassName('description')}>
                  This addon is already installed with the latest version. No further action is needed.
                </p>
              )}
            </Alert>
          )}

          {(installationStatus.status === 'complete' ||
            installationStatus.status === 'error' ||
            installationStatus.status === 'already-installed') && (
            <Row fullWidth gap='var(--space-4)' justifyContent='flex-start' alignItems='flex-start'>
              <SecondaryButton aria-label='View installed components' onClick={handleToInstalledComponents}>
                <ArrowLeftIcon size={16} />
                <span>My installed components</span>
              </SecondaryButton>
              <PrimaryButton
                variant={
                  installationStatus.status === 'complete'
                    ? 'success'
                    : installationStatus.status === 'already-installed'
                      ? 'primary'
                      : 'error'
                }
                onClick={() => {
                  if (installationStatus.status === 'complete' || installationStatus.status === 'already-installed') {
                    // Reset everything and close modal
                    setInstallationStatus({
                      status: 'idle',
                      message: '',
                      logs: [],
                    });
                    setUrl('');
                    // onClose();
                  } else {
                    // For error state, reset mutation and go back to the input
                    installAddonMutation.reset();
                    setInstallationStatus({
                      status: 'idle',
                      message: '',
                      logs: [],
                    });
                  }
                }}
                aria-label={
                  installationStatus.status === 'complete' || installationStatus.status === 'already-installed'
                    ? 'Install another'
                    : 'Try Again'
                }
              >
                {installationStatus.status === 'complete' || installationStatus.status === 'already-installed' ? (
                  <>
                    <CheckIcon size={16} />
                    <span>
                      {installationStatus.status === 'complete' || installationStatus.status === 'already-installed'
                        ? 'Install another'
                        : 'Try Again'}
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCcwDot size={16} />
                    <span>Try Again</span>
                  </>
                )}
              </PrimaryButton>
            </Row>
          )}
        </>
      )}
    </div>
  );
}
