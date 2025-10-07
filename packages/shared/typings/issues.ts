export type IssueType = 'bug' | 'feature' | 'enhancement' | 'documentation' | 'question';

export const ISSUE_TYPES_OPTIONS: {
  label: string;
  value: IssueType;
}[] = [
  {
    label: 'Bug',
    value: 'bug',
  },
  {
    label: 'Feature Request',
    value: 'feature',
  },
  {
    label: 'Enhancement',
    value: 'enhancement',
  },
  {
    label: 'Documentation',
    value: 'documentation',
  },
  {
    label: 'Question',
    value: 'question',
  },
];

export type IssueState = 'all' | 'open' | 'closed';

export const ISSUE_STATES_OPTIONS: {
  label: string;
  value: IssueState;
}[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Open',
    value: 'open',
  },
  {
    label: 'Closed',
    value: 'closed',
  },
];

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
