import React, { useState } from 'react';
import { Row } from '@components/Layout';
import { PackageIcon, DownloadIcon, GitBranchIcon, RefreshCw, GithubIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ComponentTags } from '../ComponentTags';
import { formatNumber } from '@helpers/number';
import { timeAgo } from '@hakit/core';
import { AddonWithLatestVersion } from '@typings/hono';
import { Tooltip } from '@components/Tooltip';
import { AutoHeight } from '@components/AutoHeight';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './AddonListItem.module.css';

const getClassName = getClassNameFactory('AddonListItem', styles);

interface AddonListItemProps {
  addon: AddonWithLatestVersion;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export function AddonListItem({ addon, actions, children, defaultExpanded, onClick }: AddonListItemProps) {
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
        AddonListItem: true,
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

          <div className={getClassName('addonInfo')}>
            <Row className={getClassName('addonHeader')} fullWidth alignItems='center'>
              <div className={getClassName('addonTitle')}>
                <h3 className={getClassName('addonName')}>{addon.addon.name}</h3>
                <span className={getClassName('addonAuthor')}>by {addon.addon.author}</span>
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

            {addon.addon.description && <p className={getClassName('addonDescription')}>{addon.addon.description}</p>}

            <ComponentTags components={addon.version.components || []} />

            <div className={getClassName('metaGrid')}>
              <Row className={getClassName('metaItem')}>
                <DownloadIcon size={14} />
                <Tooltip title={`Version downloads: ${formatNumber(addon.version.downloadCount)}`}>
                  <span className={getClassName('metaValue')}>{formatNumber(addon.addon.totalDownloads)} Downloads</span>
                </Tooltip>
              </Row>

              <Row className={getClassName('metaItem')}>
                <GithubIcon size={14} />
                <span className={getClassName('metaValue')}>{addon.addon.author}</span>
              </Row>

              {addon.version.version && (
                <Row className={getClassName('metaItem')}>
                  <GitBranchIcon size={14} />
                  <span className={getClassName('metaValue')}>v{addon.version.version}</span>
                </Row>
              )}

              <Row className={getClassName('metaItem')}>
                <RefreshCw size={14} />
                <span className={getClassName('metaValue')}>
                  Updated {addon.addon.lastUpdated ? timeAgo(new Date(addon.addon.lastUpdated)) : 'Unknown'}
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
