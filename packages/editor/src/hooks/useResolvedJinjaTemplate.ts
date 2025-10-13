import { useEffect, useMemo, useState, useCallback } from 'react';
import { collectTemplateFields, hasAnyTemplates, subscribeTemplate } from '@helpers/editor/templates';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { BREAKPOINT_ORDER } from '@helpers/editor/pageData/constants';
import { toNumber } from '@helpers/number';
import { toBoolean } from '@helpers/boolean';
import { CustomConfig } from '@typings/puck';
import { ComponentData } from '@measured/puck';

type UseResolveResult<T> = {
  data: T | null; // if no templates: equals input (derived, not state). if templates: state.
  loading: boolean; // derived: (hasTemplates ? data === null : false)
  error: Error | null; // setup errors (per-field errors are surfaced in-string)
  reload: () => void; // re-establish subs for current input
};

type Key = string | number;

type MaybeComponentConfig = ComponentData & {
  id?: string;
};

// We can't really determine the type of this at this level, the shape of the data is unknown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setIn(root: any, path: Key[], value: unknown) {
  if (path.length === 0) return value;
  const clone = Array.isArray(root) ? root.slice() : { ...root };
  let cursor = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const next = cursor[k];
    const nextClone = Array.isArray(next)
      ? next.slice()
      : next && typeof next === 'object' && Object.getPrototypeOf(next) === Object.prototype
        ? { ...next }
        : typeof k === 'number'
          ? []
          : {};
    cursor[k] = nextClone;
    cursor = nextClone;
  }
  cursor[path[path.length - 1]] = value;
  return clone;
}

function isBreakpointKey(k: unknown): k is string {
  return typeof k === 'string' && k.startsWith('$') && (BREAKPOINT_ORDER as readonly string[]).includes(k.slice(1));
}

function coerceResolvedValue(
  raw: number | boolean | string | null,
  path: Key[],
  currentObj: MaybeComponentConfig | undefined,
  userConfig: CustomConfig | null
): unknown {
  // Sanitize line breaks and whitespace first, then unwrap quotes
  const rawStr = typeof raw === 'string' ? raw : String(raw);
  // Determine component + field from path
  let lastPropsIdx = -1;
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i] === 'props') {
      lastPropsIdx = i;
      break;
    }
  }

  const leafKey = path[path.length - 1];
  const effectiveLeafKey: Key = isBreakpointKey(leafKey) ? path[path.length - 2] : leafKey;

  // Walk to the component node
  let componentNode = currentObj;

  if (lastPropsIdx > 0) {
    const compPath = path.slice(0, lastPropsIdx);
    let cursor = currentObj;
    for (const seg of compPath) {
      cursor = cursor?.[seg as keyof MaybeComponentConfig] as MaybeComponentConfig | undefined;
    }
    componentNode = cursor;
  }

  // Infer component type either from explicit 'type' or from an id like "FieldRework-<uuid>"
  const componentType: string = (() => {
    const explicit = componentNode?.type;
    if (typeof explicit === 'string' && explicit) return explicit;
    const idCandidate = componentNode?.props?.id ?? componentNode?.id;
    if (typeof idCandidate === 'string') {
      const prefix = idCandidate.split('-')[0];
      if (prefix && userConfig?.components && Object.prototype.hasOwnProperty.call(userConfig.components, prefix)) {
        return prefix as string;
      }
    }
    return 'root';
  })();

  // Resolve fields root for this component
  let fields = componentType === 'root' ? userConfig?.root?.fields : userConfig?.components?.[componentType]?.fields;

  const propsSegs = path.slice(lastPropsIdx + 1);
  const segs: Key[] = isBreakpointKey(leafKey) ? propsSegs.slice(0, -1) : propsSegs;

  // Walk down using objectFields/arrayFields for container fields
  for (let i = 0; i < segs.length - 1 && fields; i++) {
    const seg = segs[i];
    if (typeof seg !== 'string') continue;
    const node = fields?.[seg];
    if (!node) break;
    if (node.type === 'object' && node.objectFields) {
      fields = node.objectFields;
      continue;
    }
    if (node.type === 'array' && node.arrayFields) {
      fields = node.arrayFields;
      continue;
    }
  }

  const leaf = typeof effectiveLeafKey === 'string' ? fields?.[effectiveLeafKey] : undefined;
  const fieldType: string | undefined = leaf?.type;

  switch (fieldType) {
    case 'number':
    case 'slider':
      return toNumber(rawStr);
    case 'switch':
      return toBoolean(rawStr);
    default:
      return typeof rawStr === 'string' ? rawStr : String(rawStr);
  }
}

export function useResolvedJinjaTemplate<T>(input: T | null | undefined): UseResolveResult<T> {
  const [templatedData, setTemplatedData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const userConfig = useGlobalStore(s => s.userConfig);

  // for reload()
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken(x => x + 1), []);

  // compute once per input ref
  const hasTemplates = useMemo(() => hasAnyTemplates(input), [input]);

  // Derived return values:
  const data: T | null = hasTemplates ? templatedData : (input ?? null);
  const loading = hasTemplates ? templatedData === null : false;

  useEffect(() => {
    // If there's no input or no templates → no subs, no state writes.
    if (input == null || !hasTemplates) {
      // only clear template-state if it was previously used
      if (templatedData !== null) setTemplatedData(input ?? null);
      if (error) setError(null);
      return;
    }

    // There ARE templates → subscribe and stream updates into templatedData
    let currentObj = input;
    const nodes = collectTemplateFields(input);
    const pending = new Map<string, true>();
    for (const n of nodes) pending.set(n.path.join('|'), true);

    const controller = new AbortController();
    const unsubs: Array<() => void> = [];

    // flip flags only if changed
    if (error) setError(null);

    const applyUpdate = (path: Key[], strVal: number | boolean | string | null) => {
      const coerced = coerceResolvedValue(strVal, path, currentObj as unknown as MaybeComponentConfig | undefined, userConfig);
      const nextObj = setIn(currentObj, path, coerced);
      if (nextObj !== currentObj) {
        currentObj = nextObj;
        setTemplatedData(currentObj); // triggers render with updated data
      }
    };

    (async () => {
      try {
        await Promise.all(
          nodes.map(async ({ path, template }) => {
            const unsub = await subscribeTemplate(
              template,
              (val, error) => {
                const key = path.join('|');
                if (error) {
                  setError(new Error(error));
                  return;
                }
                if (pending.has(key)) pending.delete(key);

                applyUpdate(path, val);
              },
              { signal: controller.signal, report_errors: true, strict: false }
            );
            unsubs.push(unsub);
          })
        );
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') {
          // normal during input/reload change
        } else {
          setError(e instanceof Error ? e : new Error('Failed to subscribe to templates'));
        }
      }
    })();

    // Cleanup on input change/unmount
    return () => {
      controller.abort();
      for (const u of unsubs) {
        try {
          u();
        } catch {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, hasTemplates, reloadToken]); // no writes in the no-template path!

  return { data, loading, error, reload };
}
