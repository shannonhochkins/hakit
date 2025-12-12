// jinja-resolver.ts
import { useHass } from '@hakit/core';
import { isValidElement } from 'react';
import { TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';

import { MessageBase, UnsubscribeFunc } from 'home-assistant-js-websocket';

export type RenderTemplateParams = {
  template: string;
  variables?: Record<string, unknown>;
  timeout?: number;
  strict?: boolean;
  report_errors?: boolean;
};

type RenderTemplateResult = {
  result: string;
} & MessageBase;

type RenderTemplateError = {
  error: string;
  label: string;
};

export type ResolveOptions = Omit<RenderTemplateParams, 'template'> & { signal?: AbortSignal };

// ---------------- utilities ----------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
}

type Path = Array<string | number>;
type TemplateNode = { path: Path; template: string };

/** Collect every string starting with TEMPLATE_PREFIX. Skips functions, React elements, non-plain objects. */
export function collectTemplateFields(root: unknown): TemplateNode[] {
  const out: TemplateNode[] = [];
  const stack: Array<{ node: unknown; path: Path }> = [{ node: root, path: [] }];

  while (stack.length) {
    const { node, path } = stack.pop()!;

    if (typeof node === 'function' || isValidElement(node)) continue;
    if (typeof node === 'string') {
      if (node.startsWith(TEMPLATE_PREFIX)) {
        out.push({ path, template: node.slice(TEMPLATE_PREFIX.length) });
      }
      continue;
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        stack.push({ node: node[i], path: [...path, i] });
      }
      continue;
    }
    if (isPlainObject(node)) {
      for (const [k, v] of Object.entries(node)) {
        stack.push({ node: v, path: [...path, k] });
      }
    }
  }
  return out;
}

/** Quick boolean check. */
export function hasAnyTemplates(root: unknown): boolean {
  const stack: unknown[] = [root];
  while (stack.length) {
    const node = stack.pop();
    if (typeof node === 'function' || isValidElement(node)) continue;
    if (typeof node === 'string') {
      if (node.startsWith(TEMPLATE_PREFIX)) return true;
      continue;
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) stack.push(node[i]);
      continue;
    }
    if (isPlainObject(node)) {
      for (const v of Object.values(node)) stack.push(v);
    }
  }
  return false;
}

/** Subscribe to a single HA template; call `onValue` for every push (initial + updates). */
export async function subscribeTemplate(
  template: string,
  onValue: (val: number | boolean | string | null, error?: string) => void,
  opts?: ResolveOptions
): Promise<() => void> {
  const connection = useHass.getState().connection;
  if (!connection) throw new Error('Home Assistant connection not available.');

  let unsub: UnsubscribeFunc | null = null;
  let closed = false;

  const closeOnce = () => {
    if (closed) return;
    closed = true;
    try {
      unsub?.();
    } catch {
      /* ignore */
    }
  };

  const onAbort = () => closeOnce();
  opts?.signal?.addEventListener('abort', onAbort, { once: true });

  try {
    unsub = await connection.subscribeMessage(
      (resp: RenderTemplateResult | RenderTemplateError) => {
        if ('error' in resp) {
          onValue(null, resp.error);
          return;
        }
        if (closed || opts?.signal?.aborted) return; // ignore after close
        // just send the value back, no treatment
        onValue(resp.result);
      },
      {
        type: 'render_template',
        template,
        variables: opts?.variables,
        strict: opts?.strict ?? false,
        report_errors: opts?.report_errors ?? true,
        timeout: opts?.timeout,
      }
    );

    // If we were aborted while awaiting subscribe, close immediately now.
    if (closed || opts?.signal?.aborted) {
      try {
        unsub();
      } catch {
        /* ignore */
      }
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to subscribe to render_template');
    // If we failed after being aborted, just swallow.
    opts?.signal?.removeEventListener('abort', onAbort);
    if (err?.name === 'AbortError') return () => {};
    throw err;
  }

  // Single, idempotent cleanup
  return () => {
    opts?.signal?.removeEventListener('abort', onAbort);
    closeOnce();
  };
}
