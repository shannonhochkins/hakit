import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesQueryOptions, createIssue } from '@services/issues';
import { Row } from '@components/Layout';
import { BaseButton, PrimaryButton } from '@components/Button';
import { IssueModal } from './issueModal';
import { InputField } from '@components/Form/Field/Input';
import { EmptyState } from '@components/EmptyState';
import { SelectField } from '@components/Form/Field/Select';
import {
  AlertTriangle,
  MessageSquare,
  PlusIcon,
  SearchIcon,
  CheckCircle2,
  BugIcon,
  LightbulbIcon,
  BookIcon,
  Circle,
  AlertCircleIcon,
  Calendar1Icon,
  UserIcon,
} from 'lucide-react';
import { Tooltip } from '@components/Tooltip';
import { timeAgo } from '@hakit/core';
import { toReadableDate } from '@helpers/date';
import { useNavigate } from '@tanstack/react-router';
import { useUser } from '@hakit/core';
import { EDITOR_VERSION } from '@constants';
import type { IssueType, IssueSummary, IssueState } from '@typings/issues';
import { ISSUE_STATES_OPTIONS, ISSUE_TYPES_OPTIONS } from '@typings/issues';
import IssueLabel from './issueLabel';
import { Route as IssuesRoute } from '@routes/_authenticated/me/issues/index';
import styles from './Issues.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { Spinner } from '@components/Loaders/Spinner';

const getClassName = getClassNameFactory('Issues', styles);

// dynamic label colors implemented in IssueLabel

function getIssueTypesFromLabels(labels: string[]): IssueType[] {
  const set = new Set(labels.map(l => l.toLowerCase()));
  const list: IssueType[] = [];
  for (const t of ISSUE_TYPES_OPTIONS) {
    if (set.has(t.value)) list.push(t.value);
  }
  return list;
}

function IssueTypeIconFromLabels(labels: string[]) {
  const types = getIssueTypesFromLabels(labels);
  if (types.includes('bug')) return <BugIcon size={16} className='type-bug' />;
  if (types.includes('feature')) return <LightbulbIcon size={16} className='type-feature' />;
  if (types.includes('enhancement'))
    return (
      <svg width='16' height='16' viewBox='0 0 24 24' className='type-enhancement' aria-hidden='true'>
        <path fill='currentColor' d='M13 2v8h8v2h-8v8h-2v-8H3V10h8V2z' />
      </svg>
    );
  if (types.includes('documentation')) return <BookIcon size={16} className='type-doc' />;
  return <AlertTriangle size={16} />;
}

function plainTextFromMarkdown(md?: string, maxLength: number = 150): string {
  if (!md) return '';
  const first = md.split('\n\n')[0].replace(new RegExp('^#+\\s+.*$', 'gm'), '');
  const stripped = first
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(new RegExp('^\\s*[-*]\\s+(.*?)$', 'gm'), '$1')
    .trim();
  return stripped.length > maxLength ? stripped.slice(0, maxLength) + '…' : stripped;
}

export function Issues() {
  const qc = useQueryClient();
  const user = useUser();
  const clientUsername = user?.name || 'unknown';
  const clientVersion = EDITOR_VERSION;

  const [q, setQ] = useState('');
  const [state, setState] = useState<IssueState>('open');
  const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all');
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [createOpen, setCreateOpen] = useState(false);

  const search = IssuesRoute.useSearch();
  const navigate = useNavigate();

  const onClose = useCallback(() => {
    setCreateOpen(false);
  }, []);

  // Open modal if requested via search param
  useEffect(() => {
    if (search.modal === 'new') {
      setCreateOpen(true);
      navigate({ to: '/me/issues', replace: true, search: { modal: undefined } });
    }
  }, [search.modal, navigate]);

  const { data, isLoading } = useQuery(
    issuesQueryOptions({ q, state, labels: (typeFilter === 'all' ? undefined : typeFilter) || undefined, page, per_page: perPage })
  );

  const createMutation = useMutation({
    mutationFn: (body: { title: string; description: string; labels: string[]; area?: string }) =>
      createIssue({ title: body.title, body: body.description, labels: body.labels, clientUsername, clientVersion, area: body.area }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      setCreateOpen(false);
    },
  });

  const onCreate = useCallback(
    (payload: { title: string; description: string; labels: string[]; area?: string }) => {
      createMutation.mutate(payload);
    },
    [createMutation]
  );

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>Issues</h1>
            <p className={getClassName('pageSubtitle')}>Have an issue or feature request? Create an issue, or browse existing issues.</p>
          </div>
          <PrimaryButton aria-label='Create new issue' onClick={() => setCreateOpen(true)} startIcon={<PlusIcon size={16} />}>
            New Issue
          </PrimaryButton>
        </Row>
      </div>

      <div className={getClassName('searchAndFilter')}>
        <InputField
          type='text'
          size='medium'
          id='search-issues'
          label='Search issues'
          helperText='Search for issues by title or description'
          name='search-issues'
          placeholder='Enter a search term...'
          value={q}
          onChange={e => setQ(e.target.value)}
          startAdornment={<SearchIcon size={18} />}
        />
        <SelectField
          id='state'
          label='State'
          value={ISSUE_STATES_OPTIONS.find(opt => opt.value === state)}
          name='state'
          onChange={option => {
            setState(option.value);
            setPage(1);
          }}
          helperText='Filter issues by state'
          options={ISSUE_STATES_OPTIONS}
        />
        <SelectField
          id='type'
          label='Type'
          value={ISSUE_TYPES_OPTIONS.find(opt => opt.value === typeFilter)}
          name='type'
          onChange={option => {
            setTypeFilter(option.value as IssueType | 'all');
            setPage(1);
          }}
          helperText='Filter issues by type'
          options={[
            {
              label: 'All',
              value: 'all',
            },
            ...ISSUE_TYPES_OPTIONS,
          ]}
        />
      </div>

      {isLoading ? (
        <Row alignItems='center' justifyContent='center' gap='0.5rem' style={{ padding: '3rem' }}>
          <Spinner /> Loading issues…
        </Row>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={
            <svg width='64' height='64' viewBox='0 0 24 24' aria-hidden='true'>
              <path fill='currentColor' d='M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 5v6h-2V7h2Zm0 8v2h-2v-2h2Z' />
            </svg>
          }
          title={q ? 'No results found' : 'No issues yet'}
          description={
            q ? `No issues match "${q}". Try adjusting your search terms.` : 'Create an issue if you have a bug or feature request.'
          }
          actions={
            !q ? (
              <PrimaryButton aria-label='' onClick={() => setCreateOpen(true)} startIcon={<PlusIcon size={16} />}>
                Create an issue
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <>
          <div className={getClassName('list')}>
            {data.items.map((issue: IssueSummary & { inProgress: boolean }) => {
              const open = issue.state === 'open';
              const displayName = issue.createdBy || issue.user?.login || 'Unknown';
              const snippet = plainTextFromMarkdown(issue.body || undefined, 150);
              const labels = issue.labels;
              const visibleLabels = labels.slice(0, 3);
              const extraCount = labels.length - visibleLabels.length;
              return (
                <div
                  className={getClassName('rowGrid')}
                  key={issue.number}
                  onClick={() => {
                    navigate({ to: '/me/issues/$issue', params: { issue: issue.number.toString() } });
                  }}
                >
                  <div
                    className={getClassName({
                      statusCell: true,
                      statusCellOpen: open,
                    })}
                  >
                    {open ? (
                      <Circle
                        size={20}
                        style={{
                          color: 'var(--color-success-500)',
                        }}
                      />
                    ) : (
                      <CheckCircle2
                        size={20}
                        style={{
                          color: 'white',
                        }}
                      />
                    )}
                  </div>
                  <div className={getClassName('detailsCell')}>
                    <div className={getClassName('titleRow')}>
                      <div className={getClassName('titleLeft')}>
                        {IssueTypeIconFromLabels(labels)}
                        <div className={getClassName('titleText')}>{issue.title}</div>
                      </div>
                      <div className={getClassName('labelsRow')}>
                        {visibleLabels.map(l => (
                          <IssueLabel key={l} label={l} />
                        ))}
                        {extraCount > 0 && <div className={getClassName('moreText')}>+{extraCount} more</div>}
                      </div>
                    </div>
                    {snippet && <div className={getClassName('snippet')}>{snippet}</div>}
                    <div className={getClassName('footerRow')}>
                      <Row gap='0.25rem' alignItems='center'>
                        <AlertCircleIcon size={12} />
                        <span>#{issue.number}</span>
                      </Row>
                      <Row gap='0.25rem' alignItems='center' wrap='nowrap'>
                        <Calendar1Icon size={12} />
                        <span>
                          <Tooltip title={toReadableDate(issue.created_at)}>
                            <span>Opened {timeAgo(new Date(issue.created_at))}</span>
                          </Tooltip>
                        </span>
                      </Row>
                      {issue.area && (
                        <Row gap='0.25rem' alignItems='center' wrap='nowrap'>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{issue.area}</span>
                        </Row>
                      )}
                      <Row gap='0.25rem' alignItems='center'>
                        <UserIcon size={12} />
                        <span>{displayName}</span>
                      </Row>
                      {issue.comments > 0 && (
                        <Row gap='0.25rem' alignItems='center'>
                          <MessageSquare size={12} />
                          <span>
                            {issue.comments} comment{issue.comments === 1 ? '' : 's'}
                          </span>
                        </Row>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Row justifyContent='flex-end' alignItems='center' gap='0.5rem' style={{ marginTop: 'var(--space-3)' }}>
            <BaseButton aria-label='Previous Page' onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} size='xs'>
              Previous
            </BaseButton>
            <span style={{ color: 'var(--color-text-secondary)' }}>Page {page}</span>
            <BaseButton aria-label='Next Page' onClick={() => setPage(p => p + 1)} disabled={data && data.items.length < perPage} size='xs'>
              Next
            </BaseButton>
          </Row>
        </>
      )}

      <IssueModal open={createOpen} onClose={onClose} onCreate={onCreate} loading={createMutation.isPending} />
    </div>
  );
}
