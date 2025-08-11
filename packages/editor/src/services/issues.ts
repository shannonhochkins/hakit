import { queryOptions } from '@tanstack/react-query';
import { callApi, ToastMessages } from '@services/callApi';
import { api } from './client';

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
  inProgress?: boolean;
  body?: string | null;
  createdBy?: string | null;
  area?: string | null;
};

export type IssueListResponse = {
  total_count: number;
  items: Array<IssueSummary & { inProgress: boolean }>;
};

export type IssueDetailResponse = IssueSummary & { body?: string; inProgress: boolean };

export async function listIssues(
  params: { q?: string; state?: 'open' | 'closed' | 'all'; labels?: string; page?: number; per_page?: number } = {},
  toast?: ToastMessages
): Promise<IssueListResponse> {
  const response = await callApi(
    api.issues.$get({
      query: {
        ...(params.q ? { q: params.q } : {}),
        ...(params.state ? { state: params.state } : {}),
        ...(params.labels ? { labels: params.labels } : {}),
        ...(params.page ? { page: params.page.toString() } : {}),
        ...(params.per_page ? { per_page: params.per_page.toString() } : {}),
      },
    }),
    toast
  );
  return response as IssueListResponse;
}

export async function getIssue(number: number, toast?: ToastMessages): Promise<IssueDetailResponse> {
  const response = await callApi(api.issues[':number'].$get({ param: { number: number.toString() } }), toast);
  return response as IssueDetailResponse;
}

export type IssueComment = {
  id: number;
  body: string | null;
  user: { login: string; avatar_url: string; html_url: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  createdBy?: string | null;
};

export async function listIssueComments(number: number, toast?: ToastMessages): Promise<{ items: IssueComment[] }> {
  const response = await callApi(api.issues[':number'].comments.$get({ param: { number: number.toString() } }), toast);
  return response as { items: IssueComment[] };
}

export async function addIssueComment(
  number: number,
  body: string,
  toast?: ToastMessages,
  metadata?: { clientUsername?: string; clientVersion?: string }
): Promise<{ id: number; body: string | null; html_url: string }> {
  const response = await callApi(
    api.issues[':number'].comments.$post({
      param: { number: number.toString() },
      json: { body, clientUsername: metadata?.clientUsername, clientVersion: metadata?.clientVersion },
    }),
    toast
  );
  return response as { id: number; body: string | null; html_url: string };
}

export async function createIssue(
  data: { title: string; body: string; labels?: string[]; clientUsername?: string; clientVersion?: string; area?: string },
  toast?: ToastMessages
): Promise<{ number: number; html_url: string }> {
  const response = await callApi(api.issues.$post({ json: data }), toast);
  return response as { number: number; html_url: string };
}

export const issuesQueryOptions = (params: {
  q?: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string;
  page?: number;
  per_page?: number;
}) =>
  queryOptions({
    queryKey: ['issues', params],
    queryFn: () => listIssues(params),
    staleTime: 60 * 1000,
  });

export const issueQueryOptions = (number: number) =>
  queryOptions({
    queryKey: ['issue', number],
    queryFn: () => getIssue(number),
    staleTime: 60 * 1000,
  });

export const issueCommentsQueryOptions = (number: number) =>
  queryOptions({
    queryKey: ['issue-comments', number],
    queryFn: () => listIssueComments(number),
    staleTime: 30 * 1000,
  });
