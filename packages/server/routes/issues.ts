import { Hono } from 'hono';
import { z } from 'zod/v4';
import { zValidator } from '@hono/zod-validator';
import { describeRoute } from 'hono-openapi';
import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest';
import { getUser } from '../kinde';

const EnvSchema = z.object({
  GITHUB_PERSONAL_ACCESS_TOKEN: z.string().min(1, 'Missing GitHub token'),
  GITHUB_REPO_OWNER: z.string().min(1, 'Missing GitHub repo owner'),
  GITHUB_REPO_NAME: z.string().min(1, 'Missing GitHub repo name'),
});

const ProcessEnv = EnvSchema.parse(process.env);

const octokit = new Octokit({ auth: ProcessEnv.GITHUB_PERSONAL_ACCESS_TOKEN });
const OWNER = ProcessEnv.GITHUB_REPO_OWNER;
const REPO = ProcessEnv.GITHUB_REPO_NAME;

const listIssuesQuerySchema = z.object({
  q: z.string().optional(),
  state: z.enum(['open', 'closed', 'all']).optional().default('open'),
  labels: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
});

const addCommentBodySchema = z.object({
  body: z.string().min(1),
  clientUsername: z.string().optional(),
  clientVersion: z.string().optional(),
});

const createIssueBodySchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  labels: z.array(z.string()).optional(),
  clientUsername: z.string().optional(),
  clientVersion: z.string().optional(),
  area: z.string().optional(),
});

// Hidden metadata
const META_START = '<!-- HAKIT_META:';
const META_END = '-->';
function appendHiddenMeta(body: string, meta: Record<string, unknown>): string {
  return `${body}\n\n${META_START}${JSON.stringify(meta)} ${META_END}`;
}
function extractHiddenMeta(body: string | null | undefined): { cleanBody: string; createdBy?: string | null; area?: string | null } {
  if (!body) return { cleanBody: '', createdBy: null, area: null };
  const s = body.lastIndexOf(META_START);
  if (s === -1) return { cleanBody: body, createdBy: null, area: null };
  const e = body.indexOf(META_END, s);
  if (e === -1) return { cleanBody: body, createdBy: null, area: null };
  const json = body.substring(s + META_START.length, e).trim();
  try {
    const parsed = JSON.parse(json) as { username?: string; area?: string };
    return { cleanBody: body.substring(0, s).trim(), createdBy: parsed.username ?? null, area: parsed.area ?? null };
  } catch {
    return { cleanBody: body.substring(0, s).trim(), createdBy: null, area: null };
  }
}

type IssueFromList = RestEndpointMethodTypes['issues']['listForRepo']['response']['data'][number];
type IssueFromSearch = RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][number];

type IssueLike = IssueFromList | IssueFromSearch;

type IssueSummary = {
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

function isSearchIssue(item: IssueFromSearch): item is IssueFromSearch & { pull_request?: undefined } {
  return !('pull_request' in item);
}

function toIssueSummary(issue: IssueLike): IssueSummary {
  const labelsArray = (issue as IssueFromList).labels as Array<string | { name?: string | null }> | undefined;
  const labels = (labelsArray || []).map(l => (typeof l === 'string' ? l : l?.name || '')).filter((val): val is string => Boolean(val));
  const user = (issue as IssueFromList).user
    ? {
        login: (issue as IssueFromList).user!.login,
        avatar_url: (issue as IssueFromList).user!.avatar_url,
        html_url: (issue as IssueFromList).user!.html_url,
      }
    : null;
  const rawBody = (issue as IssueFromList).body as unknown as string | null;
  const { cleanBody, createdBy, area } = extractHiddenMeta(rawBody ?? '');
  return {
    number: (issue as IssueFromList).number,
    title: (issue as IssueFromList).title,
    state: (issue as IssueFromList).state,
    labels,
    comments: (issue as IssueFromList).comments,
    created_at: (issue as IssueFromList).created_at as unknown as string,
    updated_at: (issue as IssueFromList).updated_at as unknown as string,
    user,
    html_url: (issue as IssueFromList).html_url,
    body: cleanBody,
    createdBy: createdBy ?? null,
    area: area ?? null,
  };
}

function toHttpError(e: unknown) {
  const err = e as { status?: number; message?: string };
  const status = err?.status ?? 500;
  const message =
    status === 401
      ? 'GitHub unauthorized. Check token.'
      : status === 403
        ? 'GitHub forbidden. Token lacks access to the private repo or rate limit exceeded.'
        : status === 404
          ? 'Not found in GitHub.'
          : 'Failed to communicate with GitHub.';
  return { status, message };
}

// In-memory cache with TTL
type CacheEntry<T> = { value: T; expiresAt: number };
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const listCache = new Map<string, CacheEntry<{ total_count: number; items: Array<IssueSummary & { inProgress: boolean }> }>>();
const detailCache = new Map<number, CacheEntry<IssueSummary & { body?: string | null; inProgress: boolean }>>();
const listKeys: string[] = [];
function getListCacheKey(q?: string, state?: string, labels?: string, page?: number, per_page?: number) {
  return JSON.stringify({ q: q || '', state: state || 'open', labels: labels || '', page: page || 1, per_page: per_page || 20 });
}
function getCached<T>(map: Map<string, CacheEntry<T>>, key: string): T | null;
function getCached<T>(map: Map<number, CacheEntry<T>>, key: number): T | null;
function getCached<T>(map: Map<string | number, CacheEntry<T>>, key: string | number): T | null {
  const entry = map.get(key as never);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    map.delete(key as never);
    return null;
  }
  return entry.value;
}
function setCached<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number = ONE_DAY_MS) {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
  if (!listKeys.includes(key)) listKeys.unshift(key);
  if (listKeys.length > 50) listKeys.pop();
}
function setCachedNumberKey<T>(map: Map<number, CacheEntry<T>>, key: number, value: T, ttlMs: number = ONE_DAY_MS) {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
}

const issuesRoute = new Hono()
  .get(
    '/',
    describeRoute({ description: 'List/search GitHub issues', tags: ['Issues'], responses: { 200: { description: 'OK' } } }),
    zValidator('query', listIssuesQuerySchema),
    async c => {
      const { q, state, labels, page, per_page } = c.req.valid('query');
      try {
        const key = getListCacheKey(q, state, labels, page, per_page);
        const cached = getCached(listCache, key);
        if (cached) return c.json(cached);

        if (q && q.trim().length > 0) {
          const searchQuery = [`repo:${OWNER}/${REPO}`, 'is:issue', state !== 'all' ? `state:${state}` : '', `in:title,body ${q}`]
            .filter(Boolean)
            .join(' ');
          const result = await octokit.rest.search.issuesAndPullRequests({ q: searchQuery, page, per_page });
          const items = (result.data.items || []).filter(isSearchIssue);
          const enriched: Array<IssueSummary & { inProgress: boolean }> = items.map(item => ({
            ...toIssueSummary(item),
            inProgress: false,
          }));
          const payload = { total_count: result.data.total_count, items: enriched };
          setCached(listCache, key, payload);
          return c.json(payload);
        }

        const list = await octokit.rest.issues.listForRepo({ owner: OWNER, repo: REPO, state, labels, page, per_page });
        const issuesOnly = (list.data || []).filter(
          (i): i is IssueFromList => !('pull_request' in (i as unknown as Record<string, unknown>))
        );
        const enriched: Array<IssueSummary & { inProgress: boolean }> = issuesOnly.map(it => ({
          ...toIssueSummary(it),
          inProgress: false,
        }));
        const payload = { total_count: enriched.length, items: enriched };
        setCached(listCache, key, payload);
        return c.json(payload);
      } catch (e) {
        console.error('Issues list error', e);
        const err = toHttpError(e);
        const statusCode = (err.status === 401 || err.status === 403 || err.status === 404 ? err.status : 500) as 401 | 403 | 404 | 500;
        return c.json({ error: err.message }, statusCode);
      }
    }
  )
  .post(
    '/',
    describeRoute({ description: 'Create a new GitHub issue', tags: ['Issues'], responses: { 201: { description: 'Created' } } }),
    getUser,
    zValidator('json', createIssueBodySchema),
    async c => {
      const user = c.var.user;
      const { title, body, labels, clientUsername, clientVersion, area } = await c.req.valid('json');
      try {
        const augmented = appendHiddenMeta(body, {
          userId: user.id,
          username: clientUsername ?? null,
          version: clientVersion ?? null,
          insertedAt: new Date().toISOString(),
          area: area ?? null,
        });
        const { data } = await octokit.rest.issues.create({ owner: OWNER, repo: REPO, title, body: augmented, labels });
        // Patch cached first pages instead of invalidating
        for (const key of [...listKeys]) {
          const params = JSON.parse(key) as { state?: string; labels?: string; page?: number; per_page?: number };
          if ((params.page ?? 1) !== 1) continue;
          if (!((params.state ?? 'open') === 'open' || (params.state ?? 'open') === 'all')) continue;
          const payload = getCached(
            listCache as Map<string, CacheEntry<{ total_count: number; items: Array<IssueSummary & { inProgress: boolean }> }>>,
            key
          );
          if (!payload) continue;
          const summary = toIssueSummary(data as unknown as IssueFromList);
          const updated = {
            total_count: payload.total_count + 1,
            items: [{ ...summary, inProgress: false }, ...payload.items].slice(0, params.per_page ?? 20),
          };
          setCached(listCache, key, updated);
        }
        return c.json({ number: data.number, html_url: data.html_url }, 201);
      } catch (e) {
        console.error('Create issue error', e);
        const err = toHttpError(e);
        const statusCode = (err.status === 401 || err.status === 403 || err.status === 404 ? err.status : 500) as 401 | 403 | 404 | 500;
        return c.json({ error: err.message }, statusCode);
      }
    }
  )
  .get(
    '/:number',
    describeRoute({ description: 'Get a single GitHub issue', tags: ['Issues'], responses: { 200: { description: 'OK' } } }),
    async c => {
      const number = Number(c.req.param('number'));
      if (!Number.isFinite(number)) return c.json({ error: 'Invalid issue number' }, 400);
      try {
        const cached = getCached(detailCache, number);
        if (cached) return c.json(cached);
        const { data: issue } = await octokit.rest.issues.get({ owner: OWNER, repo: REPO, issue_number: number });
        const payload = { ...toIssueSummary(issue as IssueFromList), body: toIssueSummary(issue as IssueFromList).body, inProgress: false };
        setCachedNumberKey(detailCache, number, payload);
        return c.json(payload);
      } catch (e) {
        console.error('Issue detail error', e);
        const err = toHttpError(e);
        const statusCode = (err.status === 401 || err.status === 403 || err.status === 404 ? err.status : 500) as 401 | 403 | 404 | 500;
        return c.json({ error: err.message }, statusCode);
      }
    }
  )
  .get(
    '/:number/comments',
    describeRoute({ description: 'List comments for an issue', tags: ['Issues'], responses: { 200: { description: 'OK' } } }),
    async c => {
      const number = Number(c.req.param('number'));
      if (!Number.isFinite(number)) return c.json({ error: 'Invalid issue number' }, 400);
      try {
        const { data } = await octokit.rest.issues.listComments({ owner: OWNER, repo: REPO, issue_number: number });
        const comments = data.map(cmt => {
          const parsed = extractHiddenMeta(cmt.body ?? '');
          return {
            id: cmt.id,
            body: parsed.cleanBody,
            user: cmt.user ? { login: cmt.user.login, avatar_url: cmt.user.avatar_url, html_url: cmt.user.html_url } : null,
            created_at: cmt.created_at,
            updated_at: cmt.updated_at,
            html_url: cmt.html_url,
            createdBy: parsed.createdBy ?? null,
          };
        });
        return c.json({ items: comments });
      } catch (e) {
        console.error('Issue comments error', e);
        const err = toHttpError(e);
        const statusCode = (err.status === 401 || err.status === 403 || err.status === 404 ? err.status : 500) as 401 | 403 | 404 | 500;
        return c.json({ error: err.message }, statusCode);
      }
    }
  )
  .post(
    '/:number/comments',
    describeRoute({ description: 'Add a comment to an issue', tags: ['Issues'], responses: { 200: { description: 'OK' } } }),
    getUser,
    zValidator('json', addCommentBodySchema),
    async c => {
      const number = Number(c.req.param('number'));
      if (!Number.isFinite(number)) return c.json({ error: 'Invalid issue number' }, 400);
      const { body, clientUsername, clientVersion } = await c.req.valid('json');
      const user = c.var.user;
      try {
        const augmented = appendHiddenMeta(body, {
          userId: user.id,
          username: clientUsername ?? null,
          version: clientVersion ?? null,
          insertedAt: new Date().toISOString(),
        });
        const { data } = await octokit.rest.issues.createComment({ owner: OWNER, repo: REPO, issue_number: number, body: augmented });
        // Invalidate detail cache for this issue
        detailCache.delete(number);
        // Patch any cached list entries that include this issue by incrementing the comments count
        for (const key of [...listKeys]) {
          const payload = getCached(
            listCache as Map<string, CacheEntry<{ total_count: number; items: Array<IssueSummary & { inProgress: boolean }> }>>,
            key
          );
          if (!payload) continue;
          let found = false;
          const updatedItems = payload.items.map(item => {
            if (item.number === number) {
              found = true;
              return { ...item, comments: (item.comments ?? 0) + 1 };
            }
            return item;
          });
          if (found) {
            setCached(listCache, key, { total_count: payload.total_count, items: updatedItems });
          }
        }
        return c.json({ id: data.id, body, html_url: data.html_url }, 201);
      } catch (e) {
        console.error('Create comment error', e);
        const err = toHttpError(e);
        const statusCode = (err.status === 401 || err.status === 403 || err.status === 404 ? err.status : 500) as 401 | 403 | 404 | 500;
        return c.json({ error: err.message }, statusCode);
      }
    }
  );

export default issuesRoute;
