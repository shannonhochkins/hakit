import styled from '@emotion/styled';

function getLabelColors(name: string): { bg: string; fg: string } {
  const n = name.toLowerCase();
  if (n === 'bug') return { bg: 'var(--color-error-900)', fg: 'var(--color-error-300)' };
  if (n === 'feature') return { bg: 'var(--color-primary-900)', fg: 'var(--color-primary-300)' };
  if (n === 'enhancement') return { bg: 'var(--color-success-900)', fg: 'var(--color-success-300)' };
  if (n === 'documentation') return { bg: 'var(--color-warning-900)', fg: 'var(--color-warning-300)' };
  if (n === 'question') return { bg: 'var(--color-info-900)', fg: 'var(--color-info-300)' };
  return { bg: 'var(--color-border)', fg: 'var(--color-text-secondary)' };
}

const Chip = styled.span<{ $bg: string; $fg: string }>`
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: ${p => p.$bg};
  color: ${p => p.$fg};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export function IssueLabel({ label }: { label: string }) {
  const { bg, fg } = getLabelColors(label);
  return (
    <Chip $bg={bg} $fg={fg}>
      {label}
    </Chip>
  );
}

export default IssueLabel;
