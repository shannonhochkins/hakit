import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueQueryOptions, issueCommentsQueryOptions, addIssueComment } from '@services/issues';
import { Column, Row } from '@hakit/components';
import { PrimaryButton } from '@components/Button';
import { ArrowLeftIcon, CheckCircle2, Circle, Loader2, MessageSquare } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import { timeAgo, useUser } from '@hakit/core';
import { Tooltip } from '@components/Tooltip';
import { toReadableDate } from '@helpers/date';
import IssueLabel from '../issueLabel';
import { MarkdownRenderer } from '@components/Markdown/MarkdownRenderer';
import { EDITOR_VERSION } from '@constants';
import { MarkdownEditor } from '@components/Markdown/MarkdownEditor';
import styles from './IssuePage.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('IssuePage', styles);

export function IssuePage({ id }: { id: number }) {
  const qc = useQueryClient();
  const router = useRouter();
  const user = useUser();
  const clientUsername = user?.name || 'unknown';
  const clientVersion = EDITOR_VERSION;

  const { data: issue, isLoading } = useQuery(issueQueryOptions(id));
  const { data: commentsData, isLoading: loadingComments } = useQuery(issueCommentsQueryOptions(id));

  const [comment, setComment] = useState('');
  const addCommentMutation = useMutation({
    mutationFn: (body: string) => addIssueComment(id, body, undefined, { clientUsername, clientVersion }),
    onSuccess: () => {
      setComment('');
      qc.invalidateQueries({ queryKey: ['issue-comments', id] });
    },
  });
  const handleBack = () => {
    router.history.back();
  };

  if (isLoading || !issue) {
    return (
      <Row alignItems='center' justifyContent='center' gap='0.5rem' style={{ padding: '3rem' }}>
        <Loader2 className='spin' size={20} /> Loading issue…
      </Row>
    );
  }

  const open = issue.state === 'open';

  return (
    <div className={getClassName('container')}>
      <Row className={getClassName('backButtonContainer')} fullWidth justifyContent='flex-start' alignItems='center'>
        <button className={getClassName('backButton')} onClick={handleBack} aria-label='Back to explore'>
          <ArrowLeftIcon size={18} />
        </button>
        <h1 className={getClassName('pageTitle')}>#{issue.number}</h1>
      </Row>
      <div className={getClassName('card')}>
        <div className={getClassName('section')}>
          <Column gap='0.5rem' alignItems='flex-start' justifyContent='flex-start' wrap='wrap' fullWidth>
            <Row gap='0.5rem' alignItems='flex-start'>
              {open ? (
                <Circle size={20} style={{ color: 'var(--color-success-500)', marginTop: 'var(--space-2)' }} />
              ) : (
                <CheckCircle2 size={20} style={{ color: 'var(--color-success-500)', marginTop: 'var(--space-2)' }} />
              )}
              <Column gap='0.5rem' alignItems='flex-start' justifyContent='flex-start'>
                <h2 style={{ margin: 0 }}>{issue.title}</h2>
                <Row alignItems='flex-start' gap='0.25rem' justifyContent='flex-start' style={{ color: 'var(--color-text-muted)' }}>
                  <span>Opened by {issue.createdBy || issue.user?.login || 'Unknown'}</span>
                  <span>•</span>
                  <Tooltip title={toReadableDate(issue.created_at)}>
                    <span>{timeAgo(new Date(issue.created_at))}</span>
                  </Tooltip>
                  {issue.area && (
                    <>
                      <span>•</span>
                      <span>{issue.area}</span>
                    </>
                  )}
                </Row>
                <Row>
                  {issue.labels.map(l => (
                    <IssueLabel key={l} label={l} />
                  ))}
                </Row>
              </Column>
            </Row>
          </Column>
        </div>
        <div className={getClassName('section')}>
          <MarkdownRenderer>{issue.body || ''}</MarkdownRenderer>
        </div>
      </div>

      <div className={getClassName('card')}>
        <div className={getClassName('section')}>
          <Row gap='0.5rem' alignItems='center' justifyContent='flex-start'>
            <MessageSquare size={16} /> Comments ({commentsData?.items.length || 0})
          </Row>
        </div>
        <div className={getClassName('section')}>
          {loadingComments ? (
            <Row alignItems='center' gap='0.5rem'>
              <Loader2 className='spin' size={16} /> Loading comments…
            </Row>
          ) : (
            <Column gap='2rem'>
              {commentsData?.items.map(c => (
                <div key={c.id} className={getClassName('comment')}>
                  <Row
                    gap='0.5rem'
                    alignItems='center'
                    justifyContent='space-between'
                    style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}
                  >
                    <strong>{c.createdBy || c.user?.login || 'Unknown'}</strong>
                    <Tooltip title={toReadableDate(c.created_at)}>
                      <span>{timeAgo(new Date(c.created_at))}</span>
                    </Tooltip>
                  </Row>
                  <MarkdownRenderer>{c.body || ''}</MarkdownRenderer>
                </div>
              ))}
            </Column>
          )}
        </div>
      </div>
      <div className={getClassName('card')}>
        <div className={getClassName('section')}>
          <Row gap='0.5rem' alignItems='center' justifyContent='flex-start'>
            <MessageSquare size={16} /> Add a comment
          </Row>
        </div>
        <div className={getClassName('section')}>
          <div className={getClassName('label')}>Markdown supported in comment replies</div>
        </div>
        <div className={getClassName('section')}>
          <Column gap='1rem' fullWidth>
            <MarkdownEditor value={comment} onChange={e => e !== undefined && setComment(e)} />
            <Row gap='0.5rem' justifyContent='flex-end' alignItems='flex-end' fullWidth>
              <PrimaryButton
                aria-label='Comment'
                onClick={() => addCommentMutation.mutate(comment)}
                disabled={!comment || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? <Loader2 className='spin' size={16} /> : 'Add Comment'}
              </PrimaryButton>
            </Row>
          </Column>
        </div>
      </div>
    </div>
  );
}
