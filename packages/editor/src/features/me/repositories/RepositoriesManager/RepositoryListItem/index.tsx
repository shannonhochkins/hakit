import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { PackageIcon, DownloadIcon, GitBranchIcon, RefreshCw, GithubIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ComponentTags } from '../ComponentTags';
import { formatNumber } from '@helpers/number';
import { timeAgo } from '@hakit/core';
import { RepositoryWithLatestVersion } from '@typings/hono';
import { Tooltip } from '@components/Tooltip';

interface RepositoryListItemProps {
  repository: RepositoryWithLatestVersion;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

// Styled Components
const Card = styled.div<{ isClickable: boolean; hasChildren: boolean }>`
  width: 100%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition-normal);
  cursor: ${props => (props.isClickable ? 'pointer' : 'default')};

  &:hover {
    border-color: var(--color-border-hover);
    background: ${props => (props.isClickable ? 'var(--color-surface-muted)' : 'var(--color-surface-elevated)')};
  }
`;

const CardHeader = styled.div<{ hasChildren: boolean }>`
  padding: var(--space-4);
  ${props => props.hasChildren && 'border-bottom: 1px solid var(--color-border);'}
`;

const HeaderContent = styled(Row)`
  gap: var(--space-3);
`;

const ThumbnailContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  flex: 1;
  min-width: 0;
`;

const RepositoryHeader = styled(Row)`
  margin-bottom: var(--space-2);
`;

const RepositoryTitle = styled.div`
  flex: 1;
  min-width: 0;
`;

const RepositoryName = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RepositoryAuthor = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const ActionsContainer = styled.div`
  flex-shrink: 0;
  margin-left: var(--space-3);
`;

const RepositoryDescription = styled.p`
  color: var(--color-text-secondary);
  margin: var(--space-2) 0 var(--space-3) 0;
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-sm);
`;

const MetaGrid = styled.div`
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
`;

const MetaItem = styled(Row)`
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
`;

const MetaValue = styled.span`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ExpandButton = styled.button`
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
  margin-left: var(--space-2);

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-overlay);
  }
`;

const ExpandableContent = styled.div<{ isExpanded: boolean }>`
  max-height: ${props => (props.isExpanded ? '1000px' : '0')};
  opacity: ${props => (props.isExpanded ? '1' : '0')};
  overflow: hidden;
  transition: all var(--transition-normal);
`;

const ChildrenContainer = styled.div`
  padding: var(--space-4);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
`;

export function RepositoryListItem({ repository, actions, children, defaultExpanded, onClick }: RepositoryListItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? false);
  const hasChildren = !!children;
  const isClickable = !!onClick || hasChildren;

  const handleCardClick = (event: React.MouseEvent) => {
    // Don't trigger onClick if clicking on actions or expand button
    if ((event.target as HTMLElement).closest('[data-actions]') || (event.target as HTMLElement).closest('[data-expand-button]')) {
      return;
    }

    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }

    if (onClick) {
      onClick(event);
    }
  };

  const handleExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card isClickable={isClickable} hasChildren={hasChildren} onClick={handleCardClick}>
      <CardHeader hasChildren={hasChildren}>
        <HeaderContent fullWidth alignItems='flex-start'>
          <ThumbnailContainer>
            <ThumbnailPlaceholder>
              <PackageIcon size={32} />
            </ThumbnailPlaceholder>
          </ThumbnailContainer>

          <RepositoryInfo>
            <RepositoryHeader fullWidth alignItems='center'>
              <RepositoryTitle>
                <RepositoryName>{repository.repository.name}</RepositoryName>
                <RepositoryAuthor>by {repository.repository.author}</RepositoryAuthor>
              </RepositoryTitle>

              <Row alignItems='center' gap='var(--space-2)'>
                {actions && <ActionsContainer data-actions>{actions}</ActionsContainer>}
                {hasChildren && (
                  <ExpandButton data-expand-button onClick={handleExpandClick} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                    {isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                  </ExpandButton>
                )}
              </Row>
            </RepositoryHeader>

            {repository.repository.description && <RepositoryDescription>{repository.repository.description}</RepositoryDescription>}

            <ComponentTags components={repository.version.components || []} />

            <MetaGrid>
              <MetaItem>
                <DownloadIcon size={14} />
                <Tooltip title={`Version downloads: ${formatNumber(repository.version.downloadCount)}`}>
                  <MetaValue>{formatNumber(repository.repository.totalDownloads)} Downloads</MetaValue>
                </Tooltip>
              </MetaItem>

              <MetaItem>
                <GithubIcon size={14} />
                <MetaValue>{repository.repository.author}</MetaValue>
              </MetaItem>

              {repository.version.version && (
                <MetaItem>
                  <GitBranchIcon size={14} />
                  <MetaValue>v{repository.version.version}</MetaValue>
                </MetaItem>
              )}

              <MetaItem>
                <RefreshCw size={14} />
                <MetaValue>
                  Updated {repository.repository.lastUpdated ? timeAgo(new Date(repository.repository.lastUpdated)) : 'Unknown'}
                </MetaValue>
              </MetaItem>
            </MetaGrid>
          </RepositoryInfo>
        </HeaderContent>
      </CardHeader>

      {hasChildren && (
        <ExpandableContent isExpanded={isExpanded}>
          <ChildrenContainer>{children}</ChildrenContainer>
        </ExpandableContent>
      )}
    </Card>
  );
}
