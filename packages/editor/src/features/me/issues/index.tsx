import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesQueryOptions, createIssue } from '@services/issues';
import { Row } from '@hakit/components';
import { BaseButton, PrimaryButton } from '@components/Button';
import { IssueModal } from './issueModal';
import { InputField } from '@components/Form/Fields/Input';
import { EmptyState } from '@components/EmptyState';
import { SelectField } from '@components/Form/Fields/Select';
import {
  AlertTriangle,
  Loader2,
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
import { InputAdornment } from '@mui/material';
import type { IssueType, IssueSummary } from '@typings/issues';
import { ISSUE_TYPES } from '@typings/issues';
import IssueLabel from './issueLabel';
import { Route as IssuesRoute } from '@routes/_authenticated/me/issues/index';
import React from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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

const SearchAndFilter = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--space-4);
`;

const List = styled.div`
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const RowGrid = styled.div`
  display: flex;
  width: 100%;
  gap: 0;
  border-top: 1px solid var(--color-border);
  &:first-of-type {
    border-top: 0;
  }
`;

const StatusCell = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: ${p => (p.$open ? 'transparent' : 'var(--color-success-500)')};
`;

const DetailsCell = styled.div`
  padding: var(--space-4);
  width: 100%;
  cursor: pointer;
  &:hover {
    background: var(--color-surface-elevated);
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
`;

const TitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  .type-bug {
    color: var(--color-error-500);
  }
  .type-feature {
    color: var(--color-primary-500);
  }
  .type-enhancement {
    color: var(--color-success-500);
  }
  .type-doc {
    color: var(--color-warning-500);
  }
`;

const TitleText = styled.h3`
  margin: 0;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
`;

const Snippet = styled.div`
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
`;

const LabelsRow = styled.div`
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

const MoreText = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
`;

// label chip handled by IssueLabel component

const FooterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
`;

// dynamic label colors implemented in IssueLabel

function getIssueTypesFromLabels(labels: string[]): IssueType[] {
  const set = new Set(labels.map(l => l.toLowerCase()));
  const list: IssueType[] = [];
  for (const t of ISSUE_TYPES) {
    if (set.has(t)) list.push(t);
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
  const [state, setState] = useState<'open' | 'closed' | 'all'>('open');
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
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <HeaderContent>
            <PageTitle>Issues</PageTitle>
            <PageSubtitle>Have an issue or feature request? Create an issue, or browse existing issues.</PageSubtitle>
          </HeaderContent>
          <PrimaryButton aria-label='Create new issue' onClick={() => setCreateOpen(true)} startIcon={<PlusIcon size={16} />}>
            New Issue
          </PrimaryButton>
        </Row>
      </PageHeader>

      <SearchAndFilter>
        <InputField
          type='text'
          size='medium'
          placeholder='Search issues...'
          value={q}
          onChange={e => setQ(e.target.value)}
          variant='outlined'
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <SelectField
          value={state}
          name='state'
          onChange={e => {
            setState(e.target.value);
            setPage(1);
          }}
          options={['open', 'closed', 'all']}
          getOptionLabel={opt => String(opt)}
          size='small'
        />
        <SelectField
          value={typeFilter}
          name='type'
          onChange={e => {
            setTypeFilter(e.target.value || 'all');
            setPage(1);
          }}
          options={['', ...ISSUE_TYPES]}
          getOptionLabel={opt => (opt ? String(opt) : 'All')}
          size='small'
        />
      </SearchAndFilter>

      {isLoading ? (
        <Row alignItems='center' justifyContent='center' gap='0.5rem' style={{ padding: '3rem' }}>
          <Loader2 className='spin' size={20} /> Loading issues…
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
          <List>
            {data.items.map((issue: IssueSummary & { inProgress: boolean }) => {
              const open = issue.state === 'open';
              const displayName = issue.createdBy || issue.user?.login || 'Unknown';
              const snippet = plainTextFromMarkdown(issue.body || undefined, 150);
              const labels = issue.labels;
              const visibleLabels = labels.slice(0, 3);
              const extraCount = labels.length - visibleLabels.length;
              return (
                <RowGrid
                  key={issue.number}
                  onClick={() => {
                    navigate({ to: '/me/issues/$issue', params: { issue: issue.number.toString() } });
                  }}
                >
                  <StatusCell $open={open}>
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
                  </StatusCell>
                  <DetailsCell>
                    <TitleRow>
                      <TitleLeft>
                        {IssueTypeIconFromLabels(labels)}
                        <TitleText>{issue.title}</TitleText>
                      </TitleLeft>
                      <LabelsRow>
                        {visibleLabels.map(l => (
                          <IssueLabel key={l} label={l} />
                        ))}
                        {extraCount > 0 && <MoreText>+{extraCount} more</MoreText>}
                      </LabelsRow>
                    </TitleRow>
                    {snippet && <Snippet>{snippet}</Snippet>}
                    <FooterRow>
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
                    </FooterRow>
                  </DetailsCell>
                </RowGrid>
              );
            })}
          </List>
          <Row justifyContent='flex-end' alignItems='center' gap='0.5rem' style={{ marginTop: 'var(--space-3)' }}>
            <BaseButton aria-label='Previous Page' onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </BaseButton>
            <span style={{ color: 'var(--color-text-secondary)' }}>Page {page}</span>
            <BaseButton aria-label='Next Page' onClick={() => setPage(p => p + 1)} disabled={data && data.items.length < perPage}>
              Next
            </BaseButton>
          </Row>
        </>
      )}

      <IssueModal open={createOpen} onClose={onClose} onCreate={onCreate} loading={createMutation.isPending} />
    </Container>
  );
}
