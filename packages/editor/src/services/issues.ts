import { queryOptions } from '@tanstack/react-query';
import { callApi, ToastMessages } from '@services/callApi';
import { api } from './client';

export async function listIssues(
  params: { q?: string; state?: 'open' | 'closed' | 'all'; labels?: string; page?: number; per_page?: number } = {},
  toast?: ToastMessages
) {
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
  return response;
}

export async function getIssue(number: number, toast?: ToastMessages) {
  const response = await callApi(api.issues[':number'].$get({ param: { number: number.toString() } }), toast);
  return response;
}

export async function listIssueComments(number: number, toast?: ToastMessages) {
  const response = await callApi(api.issues[':number'].comments.$get({ param: { number: number.toString() } }), toast);
  return response;
}

export async function addIssueComment(
  number: number,
  body: string,
  toast?: ToastMessages,
  metadata?: { clientUsername?: string; clientVersion?: string }
) {
  const response = await callApi(
    api.issues[':number'].comments.$post({
      param: { number: number.toString() },
      json: { body, clientUsername: metadata?.clientUsername, clientVersion: metadata?.clientVersion },
    }),
    toast
  );
  return response;
}

export async function createIssue(
  data: { title: string; body: string; labels?: string[]; clientUsername?: string; clientVersion?: string; area?: string },
  toast?: ToastMessages
) {
  const response = await callApi(api.issues.$post({ json: data }), toast);
  return response;
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
    retry: false,
  });

export const issueQueryOptions = (number: number) =>
  queryOptions({
    queryKey: ['issue', number],
    queryFn: () => getIssue(number),
    staleTime: 60 * 1000,
    retry: false,
  });

export const issueCommentsQueryOptions = (number: number) =>
  queryOptions({
    queryKey: ['issue-comments', number],
    queryFn: () => listIssueComments(number),
    staleTime: 30 * 1000,
    retry: false,
  });
