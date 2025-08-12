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

export type IssueSummary = {
  number: number;
  title: string;
  state: string;
  labels: string[];
  comments: number;
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string; html_url: string } | null;
  html_url: string;
  body?: string | null;
  createdBy?: string | null;
  area?: string | null;
};
