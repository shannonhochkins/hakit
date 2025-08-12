import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Column, Row } from '@hakit/components';
import { Modal } from '@components/Modal/Modal';
import { InputField } from '@components/Form/Fields/Input';
import { SelectField } from '@components/Form/Fields/Select';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { Loader2, Search } from 'lucide-react';
import { listIssues } from '@services/issues';
import type { IssueType, IssueSummary } from '@typings/issues';
import { Alert } from '@components/Alert';
import { ISSUE_TYPES, getIssueTypeLabel } from '@typings/issues';
import bugTemplate from './templates/bug.md?raw';
import enhancementTemplate from './templates/enhancement.md?raw';
import documentationTemplate from './templates/documentation.md?raw';
import featureTemplate from './templates/feature.md?raw';
import questionTemplate from './templates/question.md?raw';
import { MarkdownEditor } from '@components/Markdown/MarkdownEditor';

const ResultItem = styled.button`
  width: 100%;
  text-align: left;
  padding: var(--space-2);
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  border-radius: var(--radius-md);
  background: var(--color-surface-inset);
  border: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text-primary);
`;

// type icon helper omitted in this dialog layout

function SimilarIssues({ query, onSelect }: { query: string; onSelect: (issue: IssueSummary) => void }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IssueSummary[]>([]);
  const [all, setAll] = useState<IssueSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function ensureAllLoaded() {
      if (all) return;
      setLoading(true);
      try {
        const res = await listIssues({ state: 'all', page: 1, per_page: 100 });
        if (!cancelled) setAll(res.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (query && query.trim().length >= 3 && !all) {
      void ensureAllLoaded();
    }
    return () => {
      cancelled = true;
    };
  }, [query, all]);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      const pool = all || [];
      const filtered = pool.filter(item => {
        const title = (item.title || '').toLowerCase();
        const body = (item.body || '').toLowerCase();
        const labels = (item.labels || []).join(' ').toLowerCase();
        // every token must appear in either title, body or labels
        return tokens.every(tok => title.includes(tok) || body.includes(tok) || labels.includes(tok));
      });
      setResults(filtered.slice(0, 5));
    }, 250);
    return () => clearTimeout(t);
  }, [query, all]);

  if (query.trim().length < 3) return null;
  return (
    <>
      {loading && !all ? (
        <Row
          alignItems='flex-start'
          justifyContent='flex-start'
          gap='0.5rem'
          style={{ padding: 'var(--space-2)', color: 'var(--color-text-muted)' }}
        >
          <Loader2 className='spin' size={16} /> Searching for similar issues…
        </Row>
      ) : results.length > 0 ? (
        <Column gap='0.5rem' alignItems='flex-start' justifyContent='flex-start' fullWidth>
          <Alert
            severity='warning'
            style={{
              marginBottom: `var(--space-2)`,
            }}
          >
            Similar issues found. Please check if your issue has already been reported:
          </Alert>
          {results.map(item => (
            <ResultItem key={item.number} onClick={() => onSelect(item)}>
              <Search size={14} style={{ marginTop: 2 }} />
              <Column alignItems='flex-start' justifyContent='flex-start' gap='0.25rem'>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  {(item.body || '').slice(0, 100)}
                  {(item.body || '').length > 100 ? '…' : ''}
                </div>
              </Column>
            </ResultItem>
          ))}
        </Column>
      ) : (
        <Alert severity='success' style={{ marginBottom: `var(--space-3)` }}>
          No similar issues found. You can proceed with creating a new issue.
        </Alert>
      )}
    </>
  );
}

const AREAS = ['@hakit/core', '@hakit/components', '@hakit/editor', '@hakit/addon', '@hakit/website'] as const;
type AreaType = (typeof AREAS)[number];

export function IssueModal({
  open,
  onClose,
  onCreate,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (d: { title: string; description: string; labels: string[]; area?: string }) => void;
  loading: boolean;
}) {
  const [type, setType] = useState<IssueType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<AreaType | ''>('');
  const [fullscreen, setFullscreen] = useState(false);

  const reset = useCallback(() => {
    setType('');
    setTitle('');
    setDescription('');
    setArea('');
    setFullscreen(false);
  }, []);

  useEffect(() => {
    if (open) {
      setFullscreen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!type) {
      setDescription('');
      return;
    }
    switch (type) {
      case 'bug':
        setDescription(bugTemplate);
        break;
      case 'enhancement':
        setDescription(enhancementTemplate);
        break;
      case 'feature':
        setDescription(featureTemplate);
        break;
      case 'documentation':
        setDescription(documentationTemplate);
        break;
      case 'question':
      default:
        setDescription(questionTemplate);
        break;
    }
  }, [type]);

  const modalTitle = useMemo(() => (type === 'feature' ? 'Request a Feature' : 'Report an Issue'), [type]);

  const canSubmit = Boolean(title && description && area && type);

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} fullscreen={fullscreen}>
      <Column gap='1rem' style={{ width: '100%', maxWidth: 900 }}>
        <Column fullWidth alignItems='flex-start' justifyContent='flex-start'>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Type</div>
          <SelectField<IssueType | ''>
            value={type}
            onChange={e => setType(e.target.value || '')}
            options={['', ...ISSUE_TYPES]}
            getOptionLabel={opt => (opt === '' ? 'Please select' : getIssueTypeLabel(opt))}
            size='small'
            style={{ minWidth: 220 }}
          />
        </Column>
        <Column fullWidth alignItems='flex-start' justifyContent='flex-start'>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Package / Area</div>
          <SelectField<AreaType | ''>
            value={area}
            onChange={e => setArea(e.target.value || '')}
            options={['', ...AREAS]}
            getOptionLabel={opt => (opt ? String(opt) : 'Please select')}
            size='small'
            style={{ minWidth: 260 }}
          />
        </Column>
        <Column fullWidth alignItems='flex-start' justifyContent='flex-start'>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Title</div>
          <InputField
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={type === 'feature' ? 'Brief description of the feature' : 'Brief description of the issue'}
            fullWidth
          />
        </Column>
        <SimilarIssues query={title} onSelect={() => onClose()} />
        <Column fullWidth alignItems='flex-start' justifyContent='flex-start'>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Description</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
            Markdown supported *
          </div>
          <div style={{ opacity: type ? 1 : 0.6, pointerEvents: type ? 'auto' : 'none', width: '100%' }}>
            <MarkdownEditor
              value={description}
              onChange={e => e !== undefined && setDescription(e)}
              onFullscreenToggle={fullscreen => {
                setFullscreen(fullscreen);
              }}
              textareaProps={!type ? { disabled: true, placeholder: 'Select a type to start…' } : undefined}
            />
          </div>
        </Column>
        <Row gap='0.5rem' justifyContent='flex-end' alignItems='flex-end' fullWidth>
          <SecondaryButton aria-label='Cancel' onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            aria-label={
              !title
                ? 'Please enter a title'
                : !description
                  ? 'Please enter a description'
                  : !area
                    ? 'Please select an area'
                    : !type
                      ? 'Please select a type'
                      : 'Create Issue'
            }
            onClick={() => {
              onCreate({ title, description, labels: [type], area: area || undefined });
              reset();
            }}
            disabled={loading || !canSubmit}
          >
            {loading ? <Loader2 className='spin' size={16} /> : 'Submit'}
          </PrimaryButton>
        </Row>
      </Column>
    </Modal>
  );
}
