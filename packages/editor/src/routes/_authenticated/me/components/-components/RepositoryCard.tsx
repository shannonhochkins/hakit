import React from 'react';
import styled from '@emotion/styled';
import {
  GithubIcon,
  GitBranchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  PackageIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { Menu, MenuItem } from '@mui/material';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { IconButton } from '@lib/components/Button/IconButton';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@lib/components/Table';
import { Repository, Component } from './ComponentsManager';

interface RepositoryCardProps {
  repository: Repository;
  components: Component[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComponent: (componentId: string) => void;
  onUpdate: () => void;
  onRemove: () => void;
  onCheckUpdates: () => void;
  incrementVersion: (version: string) => string;
}

const Card = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  flex: 1;
`;

const ThumbnailContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const RepositoryInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RepositoryName = styled.h3`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
`;

const RepositoryUrl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const VersionText = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  padding: 0 var(--space-2);
`;

const ExpandedContent = styled.div`
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
`;

const ExpandedInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoText = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const InfoItem = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  .value {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
`;

const InfoSeparator = styled.span`
  color: var(--color-text-muted);
`;

const ViewRepoLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-normal);

  &:hover {
    color: var(--color-primary-400);
  }
`;

const ComponentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const ComponentIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const ComponentName = styled.span`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
`;

const ComponentVersion = styled.span`
  color: var(--color-text-muted);
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const StatusText = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

export function RepositoryCard({
  repository,
  components,
  isExpanded,
  onToggleExpand,
  onToggleComponent,
  onUpdate,
  onRemove,
  onCheckUpdates,
  incrementVersion,
}: RepositoryCardProps) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRemoveClick = () => {
    handleMenuClose();
    onRemove();
  };

  const handleCheckUpdatesClick = () => {
    handleMenuClose();
    onCheckUpdates();
  };

  return (
    <Card>
      <CardHeader>
        <HeaderLeft onClick={onToggleExpand}>
          <IconButton
            variant='transparent'
            size='sm'
            aria-label={isExpanded ? 'Collapse repository' : 'Expand repository'}
            icon={isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          />
          <ThumbnailContainer>
            {repository.thumbnail ? (
              <ThumbnailImage src={repository.thumbnail} alt={repository.name} />
            ) : (
              <ThumbnailPlaceholder>
                <GithubIcon size={16} />
              </ThumbnailPlaceholder>
            )}
          </ThumbnailContainer>
          <RepositoryInfo>
            <RepositoryName>{repository.name}</RepositoryName>
            <RepositoryUrl>
              <GitBranchIcon size={12} />
              <span>{repository.url}</span>
            </RepositoryUrl>
          </RepositoryInfo>
        </HeaderLeft>

        <HeaderRight>
          {repository.hasUpdate ? (
            <SecondaryButton
              startIcon={<RefreshCwIcon size={14} />}
              onClick={onUpdate}
              aria-label={`Update to version ${incrementVersion(repository.version)}`}
            >
              Update to v{incrementVersion(repository.version)}
            </SecondaryButton>
          ) : (
            <VersionText>v{repository.version}</VersionText>
          )}
          <IconButton
            variant='transparent'
            size='sm'
            onClick={handleMenuOpen}
            aria-label='Repository actions'
            icon={<MoreVerticalIcon size={16} />}
          />
        </HeaderRight>
      </CardHeader>

      {isExpanded && (
        <ExpandedContent>
          <ExpandedInfo>
            <InfoText>
              <InfoItem>
                Components: <span className='value'>{components.length}</span>
              </InfoItem>
              <InfoSeparator>|</InfoSeparator>
              <InfoItem>
                Version: <span className='value'>{repository.version}</span>
              </InfoItem>
            </InfoText>
            <ViewRepoLink href={repository.url} target='_blank' rel='noopener noreferrer'>
              <span>View repository</span>
              <ExternalLinkIcon size={14} />
            </ViewRepoLink>
          </ExpandedInfo>
        </ExpandedContent>
      )}

      {isExpanded && components.length > 0 && (
        <TableContainer
          style={{
            borderRadius: 'none',
            border: 'none',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Component</TableHeaderCell>
                <TableHeaderCell hiddenBelow='md'>Version</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components.map(component => (
                <TableRow key={component.id}>
                  <TableCell>
                    <ComponentInfo>
                      <ComponentIcon>
                        <PackageIcon size={16} />
                      </ComponentIcon>
                      <ComponentName>{component.name}</ComponentName>
                    </ComponentInfo>
                  </TableCell>
                  <TableCell hiddenBelow='md'>
                    <ComponentVersion>{component.version}</ComponentVersion>
                  </TableCell>
                  <TableCell>
                    <StatusContainer>
                      <SwitchField checked={component.enabled} onChange={() => onToggleComponent(component.id)} label='' />
                      <StatusText>{component.enabled ? 'Enabled' : 'Disabled'}</StatusText>
                    </StatusContainer>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleCheckUpdatesClick}>
          <RefreshCwIcon size={16} style={{ marginRight: 8 }} />
          Check for Updates
        </MenuItem>
        <MenuItem onClick={handleRemoveClick} style={{ color: 'var(--color-error-500)' }}>
          <TrashIcon size={16} style={{ marginRight: 8 }} />
          Remove Repository
        </MenuItem>
      </Menu>
    </Card>
  );
}
