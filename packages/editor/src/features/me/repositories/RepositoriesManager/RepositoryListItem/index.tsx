import React, { useState } from 'react';
import { Row } from '@components/Layout';
import { PackageIcon, DownloadIcon, GitBranchIcon, RefreshCw, GithubIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ComponentTags } from '../ComponentTags';
import { formatNumber } from '@helpers/number';
import { timeAgo } from '@hakit/core';
import { RepositoryWithLatestVersion } from '@typings/hono';
import { Tooltip } from '@components/Tooltip';
import { AutoHeight } from '@components/AutoHeight';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './RepositoryListItem.module.css';

const getClassName = getClassNameFactory('RepositoryListItem', styles);

interface RepositoryListItemProps {
  repository: RepositoryWithLatestVersion;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

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
    <div
      className={getClassName({
        RepositoryListItem: true,
        isClickable: isClickable,
        hasChildren: hasChildren,
      })}
      onClick={handleCardClick}
    >
      <div
        className={getClassName(
          'cardHeader',
          getClassName({
            hasChildren: hasChildren,
          })
        )}
      >
        <Row className={getClassName('headerContent')} fullWidth alignItems='flex-start'>
          <div className={getClassName('thumbnailContainer')}>
            <div className={getClassName('thumbnailPlaceholder')}>
              <PackageIcon size={32} />
            </div>
          </div>

          <div className={getClassName('repositoryInfo')}>
            <Row className={getClassName('repositoryHeader')} fullWidth alignItems='center'>
              <div className={getClassName('repositoryTitle')}>
                <h3 className={getClassName('repositoryName')}>{repository.repository.name}</h3>
                <span className={getClassName('repositoryAuthor')}>by {repository.repository.author}</span>
              </div>

              <Row alignItems='center' gap='var(--space-2)'>
                {actions && (
                  <div className={getClassName('actionsContainer')} data-actions>
                    {actions}
                  </div>
                )}
                {hasChildren && (
                  <button
                    className={getClassName('expandButton')}
                    data-expand-button
                    onClick={handleExpandClick}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                  </button>
                )}
              </Row>
            </Row>

            {repository.repository.description && (
              <p className={getClassName('repositoryDescription')}>{repository.repository.description}</p>
            )}

            <ComponentTags components={repository.version.components || []} />

            <div className={getClassName('metaGrid')}>
              <Row className={getClassName('metaItem')}>
                <DownloadIcon size={14} />
                <Tooltip title={`Version downloads: ${formatNumber(repository.version.downloadCount)}`}>
                  <span className={getClassName('metaValue')}>{formatNumber(repository.repository.totalDownloads)} Downloads</span>
                </Tooltip>
              </Row>

              <Row className={getClassName('metaItem')}>
                <GithubIcon size={14} />
                <span className={getClassName('metaValue')}>{repository.repository.author}</span>
              </Row>

              {repository.version.version && (
                <Row className={getClassName('metaItem')}>
                  <GitBranchIcon size={14} />
                  <span className={getClassName('metaValue')}>v{repository.version.version}</span>
                </Row>
              )}

              <Row className={getClassName('metaItem')}>
                <RefreshCw size={14} />
                <span className={getClassName('metaValue')}>
                  Updated {repository.repository.lastUpdated ? timeAgo(new Date(repository.repository.lastUpdated)) : 'Unknown'}
                </span>
              </Row>
            </div>
          </div>
        </Row>
      </div>

      {hasChildren && (
        <AutoHeight isOpen={isExpanded} duration={300}>
          <div className={getClassName('childrenContainer')} onClick={e => e.stopPropagation()}>
            {children}
          </div>
        </AutoHeight>
      )}
    </div>
  );
}
