export type IssueType = 'bug' | 'feature' | 'enhancement' | 'documentation' | 'question';

export const ISSUE_TYPES: IssueType[] = ['bug', 'feature', 'enhancement', 'documentation', 'question'];

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  enhancement: 'Enhancement',
  documentation: 'Documentation',
  question: 'Question',
};

export function getIssueTypeLabel(type: IssueType): string {
  return ISSUE_TYPE_LABELS[type];
}
