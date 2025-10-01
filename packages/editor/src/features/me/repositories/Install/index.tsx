import { useNavigate } from '@tanstack/react-router';

import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
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
import { InputField } from '@components/Form/Fields/Input';
import { FieldGroup } from '@components/Form/FieldWrapper/FieldGroup';
import { FieldLabel } from '@components/Form/FieldWrapper/FieldLabel';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { installRepositoryFromGithub, userRepositoriesQueryOptions } from '@services/repositories';
import { Row } from '@components/Layout';
import { SecondaryButton } from '@components/Button';
import { Alert } from '@components/Alert';

interface InstallationStatus {
  status: 'idle' | 'installing' | 'complete' | 'error' | 'already-installed';
  message: string;
  logs: Array<{ id: string; message: string; status: 'success' | 'warning' | 'error'; timestamp: Date }>;
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  .mq-md & {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: var(--color-text-muted);
  margin: 0;
`;

const Description = styled.p`
  width: 100%;
  font-size: var(--font-size-sm);
  text-align: left;
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-relaxed);
`;

const InstallationLogContainer = styled.div`
  width: 100%;
`;

const InstallationLogTitle = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
`;

const InstallationLogScrollArea = styled.div`
  background: var(--color-surface);
  border: 1px solid #30363d;
  border-radius: var(--radius-md);
  height: 40vh;
  overflow-y: auto;
  padding: var(--space-2);
`;

const InstallationLogContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const InstallationLogEntry = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2);
  font-size: var(--font-size-sm);
  border-bottom: 1px solid #21262d;

  &:last-child {
    border-bottom: none;
  }
`;

const InstallationLogIcon = styled.div`
  flex-shrink: 0;
  margin-top: 2px;
`;

const InstallationLogDetails = styled.div`
  flex: 1;
`;

const InstallationLogMessage = styled.div<{ status: 'success' | 'warning' | 'error' }>`
  color: ${props => {
    switch (props.status) {
      case 'error':
        return '#f85149';
      case 'warning':
        return '#f0883e';
      default:
        return 'white';
    }
  }};
`;

const InstallationLogTimestamp = styled.div`
  font-size: var(--font-size-xs);
  color: #6e7681;
`;

const InstallationLogEmpty = styled.div`
  text-align: center;
  color: #6e7681;
  padding: var(--space-4) 0;
`;

const Important = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
`;

const ImportantTitle = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  gap: var(--space-2);
  display: flex;
  align-items: center;
`;

const ImportantBlock = styled.code`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  background: transparent;
`;

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
      to: '/me/repositories',
    });
  };

  // Mutation for installing repository from GitHub with streaming
  const installRepoMutation = useMutation({
    mutationFn: async (repositoryUrl: string) => {
      // Reset status and start installation
      setInstallationStatus({
        status: 'installing',
        message: 'Starting installation...',
        logs: [],
      });
      setShowAlert(false);

      return installRepositoryFromGithub(repositoryUrl, progress => {
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
      // Refresh user repositories
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });

      // Only set to complete if not already marked as already-installed during streaming
      setInstallationStatus(prev => {
        if (prev.status === 'already-installed') {
          return {
            ...prev,
            message: 'Repository already installed',
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
    installRepoMutation.reset();

    installRepoMutation.mutate(url);
  };

  return (
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <HeaderContent>
            <PageTitle>{'Install Repositories'}</PageTitle>
            <PageSubtitle>Install new Repositories & component(s) from GitHub</PageSubtitle>
          </HeaderContent>
          <PrimaryButton
            aria-label={url.trim() ? 'Install repository' : 'Provide repository URL'}
            disabled={!url.trim()}
            onClick={handleInstall}
            startIcon={<PlusIcon size={16} />}
          >
            Install Addon
          </PrimaryButton>
        </Row>
      </PageHeader>
      {installationStatus.status === 'idle' ? (
        <>
          <FieldGroup className='full-width'>
            <FieldLabel htmlFor='repo-url' label='Repository URL' />
            <InputField
              id='repo-url'
              type='url'
              placeholder='https://github.com/username/repository'
              value={url}
              onChange={e => setUrl(e.target.value)}
              variant='outlined'
              size='small'
              fullWidth
              helperText='Enter the URL of a compatible HAKIT component repository. The system will validate and install the components.'
              slotProps={{
                input: {
                  startAdornment: (
                    <GitBranchIcon
                      size={16}
                      style={{
                        marginRight: 'var(--space-2)',
                      }}
                    />
                  ),
                },
              }}
            />
            <Important>
              <ImportantTitle>
                <AlertCircleIcon
                  size={16}
                  style={{
                    color: 'var(--color-warning-500)',
                  }}
                />
                Important Information
              </ImportantTitle>
              <ImportantBlock>
                <ArrowRightIcon size={16} />
                Only install repositories from trusted sources.
              </ImportantBlock>
              <ImportantBlock>
                <ArrowRightIcon size={16} />
                Custom repositories must follow the HAKIT component structure.
              </ImportantBlock>
              <ImportantBlock>
                <ArrowRightIcon size={16} />
                Installation may take several minutes to complete.
              </ImportantBlock>
            </Important>
          </FieldGroup>
        </>
      ) : (
        <>
          <InstallationLogContainer>
            <InstallationLogTitle>Installation Log</InstallationLogTitle>
            <InstallationLogScrollArea ref={logsScrollAreaRef}>
              <InstallationLogContent>
                {installationStatus.logs.map(log => (
                  <InstallationLogEntry key={log.id}>
                    <InstallationLogIcon>{getLogStatusIcon(log.status)}</InstallationLogIcon>
                    <InstallationLogDetails>
                      <InstallationLogMessage status={log.status}>{log.message}</InstallationLogMessage>
                      <InstallationLogTimestamp>{log.timestamp.toLocaleTimeString()}</InstallationLogTimestamp>
                    </InstallationLogDetails>
                  </InstallationLogEntry>
                ))}
                {installationStatus.logs.length === 0 && <InstallationLogEmpty>No logs available</InstallationLogEmpty>}
              </InstallationLogContent>
            </InstallationLogScrollArea>
          </InstallationLogContainer>

          {showAlert && (
            <Alert
              title={installationStatus.message}
              severity={
                installationStatus.status === 'error' ? 'error' : installationStatus.status === 'already-installed' ? 'warning' : 'success'
              }
            >
              {installationStatus.status === 'installing' && (
                <Description>Please wait while the repository is being installed. This may take a few moments.</Description>
              )}
              {installationStatus.status === 'error' && (
                <Description>An error occurred during installation. Please check the logs below for details.</Description>
              )}
              {installationStatus.status === 'complete' && (
                <Description>The repository has been successfully installed. You can now use the components in your dashboard.</Description>
              )}
              {installationStatus.status === 'already-installed' && (
                <Description>This repository is already installed with the latest version. No further action is needed.</Description>
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
                    installRepoMutation.reset();
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
    </Container>
  );
}
