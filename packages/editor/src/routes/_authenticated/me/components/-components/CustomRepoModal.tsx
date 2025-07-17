import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { GitBranchIcon, CheckCircleIcon, AlertCircleIcon, ArrowRightIcon, CheckIcon, XIcon, LoaderIcon, ArrowLeftIcon } from 'lucide-react';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { InputField } from '@lib/components/Form/Fields/Input';
import { Modal, ModalActions } from '@lib/components/Modal';
import { FieldGroup } from '@lib/components/Form/FieldWrapper/FieldGroup';
import { FieldLabel } from '@lib/components/Form/FieldWrapper/FieldLabel';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { installRepositoryFromGithub, userRepositoriesQueryOptions } from '@lib/api/components';
import { Column, Row } from '@hakit/components';

interface CustomRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InstallationStatus {
  status: 'idle' | 'installing' | 'complete' | 'error';
  message: string;
  logs: Array<{ id: string; message: string; status: 'success' | 'warning' | 'error'; timestamp: Date }>;
}

const Description = styled.p`
  width: 100%;
  font-size: var(--font-size-sm);
  text-align: left;
  text-align: center;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6) 0;
  line-height: var(--line-height-relaxed);
`;

const InstallationLogContainer = styled.div`
  margin-bottom: var(--space-6);
  width: 100%;
`;

const InstallationLogTitle = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
`;

const InstallationLogScrollArea = styled.div`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: var(--radius-md);
  height: 192px; /* h-48 = 12rem = 192px */
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

const ButtonContainer = styled(Row)`
  margin-top: var(--space-4);
  margin-bottom: var(--space-4);
`;

const StatusText = styled(Column)`
  gap: var(--space-2);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
`;

const Important = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-top: var(--space-2);
`;

const ImportantTitle = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
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

const StatusIcon = styled.div<{ status: InstallationStatus['status'] }>`
  color: ${props => {
    switch (props.status) {
      case 'complete':
        return 'var(--color-success-500)';
      case 'installing':
        return 'var(--color-primary-500)';
      case 'error':
        return 'var(--color-error-500)';
      default:
        return 'var(--color-text-muted)';
    }
  }};
`;

const SpinningIcon = styled.div`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Helper function to get the icon for a log status
const getStatusIcon = (status: InstallationStatus['status']) => {
  switch (status) {
    case 'idle':
    case 'installing':
      return (
        <SpinningIcon>
          <LoaderIcon size={48} />
        </SpinningIcon>
      );
    case 'error':
      return <XIcon size={48} />;
    case 'complete':
      return <CheckIcon size={48} />;
  }
};

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

export function CustomRepoModal({ isOpen, onClose }: CustomRepoModalProps) {
  const [url, setUrl] = useState('');
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>({
    status: 'idle',
    message: '',
    logs: [],
  });
  const queryClient = useQueryClient();
  const logsScrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs are updated
  useEffect(() => {
    if (logsScrollAreaRef.current) {
      logsScrollAreaRef.current.scrollTop = logsScrollAreaRef.current.scrollHeight;
    }
  }, [installationStatus.logs]);

  // Mutation for installing repository from GitHub with streaming
  const installRepoMutation = useMutation({
    mutationFn: async (repositoryUrl: string) => {
      // Reset status and start installation
      setInstallationStatus({
        status: 'installing',
        message: 'Starting installation...',
        logs: [],
      });

      return installRepositoryFromGithub(repositoryUrl, progress => {
        setInstallationStatus(prev => ({
          ...prev,
          message: progress.message,
          logs: [
            ...prev.logs,
            {
              id: Date.now().toString() + Math.random().toString(),
              message: progress.message,
              status: progress.status,
              timestamp: new Date(),
            },
          ],
        }));
      });
    },
    onSuccess: () => {
      // Refresh user repositories
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });

      // Mark installation as complete
      setInstallationStatus(prev => ({
        ...prev,
        status: 'complete',
        message: 'Installation completed successfully!',
      }));

      // Auto-close after delay
      // setTimeout(() => {
      //   setInstallationStatus({
      //     status: 'idle',
      //     message: '',
      //     logs: [],
      //   });
      //   setUrl('');
      //   onClose();
      // }, 1500);
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
    },
  });

  const handleInstall = () => {
    if (!url.trim()) return;

    // Reset the mutation state before starting a new installation
    installRepoMutation.reset();

    installRepoMutation.mutate(url);
  };

  const canClose = installationStatus.status === 'idle';

  return (
    <Modal open={isOpen} onClose={canClose ? onClose : () => {}} title='Add Custom Repository' hideCloseButton={!canClose}>
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

          <ModalActions>
            <SecondaryButton onClick={onClose} aria-label='Cancel'>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleInstall} disabled={!url.trim()} aria-label='Install repository'>
              Install Repository
            </PrimaryButton>
          </ModalActions>
        </>
      ) : (
        <>
          <StatusText fullWidth>
            <StatusIcon status={installationStatus.status}>{getStatusIcon(installationStatus.status)}</StatusIcon>
            <span>{installationStatus.message}</span>

            {installationStatus.status === 'installing' && (
              <Description>Please wait while the repository is being installed. This may take a few moments.</Description>
            )}
            {installationStatus.status === 'error' && (
              <Description>An error occurred during installation. Please check the logs below for details.</Description>
            )}
            {installationStatus.status === 'complete' && (
              <Description>The repository has been successfully installed. You can now use the components in your dashboard.</Description>
            )}
          </StatusText>

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

          {(installationStatus.status === 'complete' || installationStatus.status === 'error') && (
            <ButtonContainer fullWidth>
              <PrimaryButton
                variant={installationStatus.status === 'complete' ? 'success' : 'error'}
                onClick={() => {
                  if (installationStatus.status === 'complete') {
                    // Reset everything and close modal
                    setInstallationStatus({
                      status: 'idle',
                      message: '',
                      logs: [],
                    });
                    setUrl('');
                    onClose();
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
                aria-label={installationStatus.status === 'complete' ? 'Done' : 'Try Again'}
              >
                {installationStatus.status === 'complete' ? (
                  <>
                    <CheckIcon size={16} />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftIcon size={16} />
                    <span>Try Again</span>
                  </>
                )}
              </PrimaryButton>
            </ButtonContainer>
          )}
        </>
      )}
    </Modal>
  );
}
