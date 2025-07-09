import styled from '@emotion/styled';
import { GitBranchIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { InputField } from '@lib/components/Form/Fields/Input';
import { Modal, ModalActions } from '@lib/components/Modal';
import { InstallationStatus } from './ComponentsManager';

interface CustomRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onUrlChange: (url: string) => void;
  onInstall: () => void;
  installationStatus: InstallationStatus;
}

const Description = styled.p`
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6) 0;
  line-height: var(--line-height-relaxed);
`;

const FormGroup = styled.div`
  margin-bottom: var(--space-6);
`;

const Label = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
`;

const ProgressContainer = styled.div`
  margin: var(--space-4) 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
  width: ${props => props.progress}%;
  transition: width var(--transition-normal);
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const StatusIcon = styled.div<{ status: InstallationStatus['status'] }>`
  color: ${props => {
    switch (props.status) {
      case 'complete':
        return 'var(--color-success-500)';
      case 'downloading':
      case 'validating':
      case 'installing':
        return 'var(--color-primary-500)';
      default:
        return 'var(--color-text-muted)';
    }
  }};
`;

const Example = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-top: var(--space-2);
`;

const ExampleTitle = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ExampleUrl = styled.code`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  font-family: var(--font-mono, 'Monaco', 'Consolas', monospace);
`;

export function CustomRepoModal({ isOpen, onClose, url, onUrlChange, onInstall, installationStatus }: CustomRepoModalProps) {
  const canClose = installationStatus.status === 'idle';

  return (
    <Modal open={isOpen} onClose={canClose ? onClose : () => {}} title='Add Custom Repository' hideCloseButton={!canClose}>
      {installationStatus.status === 'idle' ? (
        <>
          <Description>
            Enter the URL of a compatible HAKIT component repository. The system will validate and install the components.
          </Description>

          <FormGroup>
            <Label htmlFor='repo-url'>Repository URL</Label>
            <InputField
              id='repo-url'
              type='url'
              placeholder='https://github.com/username/repository'
              value={url}
              onChange={e => onUrlChange(e.target.value)}
              variant='outlined'
              size='small'
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <GitBranchIcon size={16} />,
                },
              }}
            />
            <Example>
              <ExampleTitle>Example</ExampleTitle>
              <ExampleUrl>
                <GitBranchIcon size={16} />
                https://github.com/custom-cards/button-card
              </ExampleUrl>
            </Example>
          </FormGroup>

          <ModalActions>
            <SecondaryButton onClick={onClose} aria-label='Cancel'>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={onInstall} disabled={!url.trim()} aria-label='Install repository'>
              Install Repository
            </PrimaryButton>
          </ModalActions>
        </>
      ) : (
        <>
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill progress={installationStatus.progress} />
            </ProgressBar>
            <ProgressText>
              <StatusIcon status={installationStatus.status}>
                {installationStatus.status === 'complete' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
              </StatusIcon>
              <span>{installationStatus.message}</span>
            </ProgressText>
          </ProgressContainer>

          {installationStatus.status !== 'complete' && (
            <Description>Please wait while the repository is being installed. This may take a few moments.</Description>
          )}
        </>
      )}
    </Modal>
  );
}
