import { useMemo } from 'react';
import { useStore, useTemplate } from '@hakit/core';
import { TEMPLATE_PREFIX } from '../pageData/constants';
import { useGlobalStore } from '@hooks/useGlobalStore';
import type { CustomConfigWithDefinition } from '@typings/puck';
import type { DefaultComponentProps } from '@measured/puck';
import type { FieldConfigurationWithDefinition } from '@typings/fields';

type Path = Array<string | number>;

type CoerceResult = { ok: true; value: unknown } | { ok: false; error: string };

function isTemplateString(val: unknown): val is string {
  return typeof val === 'string' && val.startsWith(TEMPLATE_PREFIX);
}

function normalizeExpression(prefixed: string): string {
  const raw = prefixed.slice(TEMPLATE_PREFIX.length).trim();
  if (raw.startsWith('{{') && raw.endsWith('}}')) {
    return raw.slice(2, -2).trim();
  }
  return raw;
}

function splitPathToSegs(flatPath: string): (string | number)[] {
  const trimmed = flatPath.replace(/\/+$/, '');
  // Prefer dot-notation paths
  if (trimmed.includes('.')) {
    return trimmed
      .split('.')
      .filter(Boolean)
      .map(seg => (seg.match(/^\d+$/) ? Number(seg) : seg));
  }
  // Fallback: slash paths with possible repo scope '@scope/pkg/...'
  const parts = trimmed.split('/').filter(Boolean);
  let segments: string[] = [];
  if (trimmed.startsWith('@') && parts.length >= 2) {
    const repo = `${parts[0]}/${parts[1]}`;
    segments = [repo, ...parts.slice(2)];
  } else {
    segments = parts;
  }
  return segments.map(seg => (seg.match(/^\d+$/) ? Number(seg) : seg));
}

function getAtPath(root: unknown, path: Path): unknown {
  let cursor = root;
  for (let i = 0; i < path.length; i++) {
    if (cursor && typeof cursor === 'object') {
      cursor = (cursor as Record<string | number, unknown>)[path[i]];
    } else {
      return undefined;
    }
  }
  return cursor;
}

function setAtPathImmutable<T>(root: T, path: Path, value: unknown): T {
  if (!root || path.length === 0) return root;

  const cloneLevel = (current: unknown, idx: number): unknown => {
    if (current == null) return current;
    const key = path[idx];
    if (idx === path.length - 1) {
      if (Array.isArray(current)) {
        const arr = current.slice();
        if (typeof key === 'number') arr[key] = value;
        else (arr as unknown as Record<string, unknown>)[String(key)] = value;
        return arr;
      }
      if (typeof current === 'object') {
        return { ...(current as Record<string, unknown>), [key as string | number]: value } as Record<string, unknown>;
      }
      return current;
    }
    const next = (current as Record<string | number, unknown>)[key as string | number];
    const updatedChild = cloneLevel(next, idx + 1);
    if (updatedChild === next) return current;
    if (Array.isArray(current)) {
      const arr = current.slice();
      if (typeof key === 'number') arr[key] = updatedChild;
      else (arr as unknown as Record<string, unknown>)[String(key)] = updatedChild as unknown as never;
      return arr;
    }
    if (typeof current === 'object') {
      return { ...(current as Record<string, unknown>), [key as string | number]: updatedChild } as Record<string, unknown>;
    }
    return current;
  };

  return cloneLevel(root, 0) as T;
}

function coerceToTypeStrict(value: unknown, fieldType: string | undefined): CoerceResult {
  if (!fieldType) return { ok: true, value };
  switch (fieldType) {
    case 'number':
    case 'slider': {
      if (typeof value === 'number') return { ok: true, value };
      if (typeof value === 'string') {
        const cleaned = value.replace(/\s+/g, '');
        const n = parseFloat(cleaned);
        if (!Number.isNaN(n)) return { ok: true, value: n };
        return { ok: false, error: `Expected "number" but got "${value}"` };
      }
      return { ok: false, error: `Expected "number" but got type ${typeof value}` };
    }
    case 'switch': {
      if (typeof value === 'boolean') return { ok: true, value };
      if (typeof value === 'number') return { ok: true, value: value !== 0 };
      if (typeof value === 'string') {
        const v = value.replace(/\s+/g, '').toLowerCase();
        if (v === 'true' || v === 'on' || v === 'yes' || v === '1') return { ok: true, value: true };
        if (v === 'false' || v === 'off' || v === 'no' || v === '0') return { ok: true, value: false };
        return { ok: false, error: `Expected "boolean" but got "${value}"` };
      }
      return { ok: false, error: `Expected "boolean" but got type ${typeof value}` };
    }
    // treat these as strings explicitly
    case 'text':
    case 'textarea':
    case 'code':
    case 'color':
    case 'entity':
    case 'service':
    case 'page':
    case 'radio':
    case 'select': {
      if (typeof value === 'string') return { ok: true, value };
      if (value == null) return { ok: true, value: '' };
      try {
        return { ok: true, value: String(value) };
      } catch {
        return { ok: false, error: `Expected "string" but got unstringifiable value` };
      }
    }
    default:
      return { ok: true, value };
  }
}

function resolveFieldTypeForPath(
  fields: FieldConfigurationWithDefinition<DefaultComponentProps> | undefined,
  pathSegs: (string | number)[]
): string | undefined {
  if (!fields) return undefined;
  let currentFields = fields as unknown as Record<string, unknown> | undefined;
  let currentFieldConfig: { _field?: { type?: string; objectFields?: unknown; arrayFields?: unknown } } | undefined = undefined;
  for (let i = 0; i < pathSegs.length; i++) {
    const seg = pathSegs[i];
    if (typeof seg === 'number') {
      // in arrays, just skip numeric indices
      continue;
    }
    if (!currentFields) return currentFieldConfig?._field?.type;
    const nextField = currentFields[seg] as { _field?: { type?: string; objectFields?: unknown; arrayFields?: unknown } } | undefined;
    if (!nextField) return currentFieldConfig?._field?.type;
    currentFieldConfig = nextField;
    const fType = nextField?._field?.type;
    if (fType === 'object') {
      currentFields = (nextField?._field?.objectFields ?? undefined) as unknown as Record<string, unknown> | undefined;
      continue;
    }
    if (fType === 'array') {
      currentFields = (nextField?._field?.arrayFields ?? undefined) as unknown as Record<string, unknown> | undefined;
      continue;
    }
    // primitive; if there are more segs, still return this as best-known type
    currentFields = undefined;
  }
  return currentFieldConfig?._field?.type;
}

function getExpectedFieldType(
  userConfig: CustomConfigWithDefinition<DefaultComponentProps> | null,
  componentId: string,
  flatKey: string
): string | undefined {
  if (!userConfig) return undefined;
  const segs = splitPathToSegs(flatKey);
  // Resolve component type from page data in store
  const pageData = useGlobalStore.getState().puckPageData;
  if (componentId === 'root') {
    const rootCfg = userConfig.root as unknown as { fields?: FieldConfigurationWithDefinition<DefaultComponentProps> };
    const rootFields = rootCfg?.fields;
    return resolveFieldTypeForPath(rootFields, segs);
  }
  const item = pageData?.content?.find(c => (c as { props?: { id?: string } })?.props?.id === componentId) as { type?: string } | undefined;
  const compType = item?.type;
  if (!compType) return undefined;
  const comps = userConfig.components as unknown as Record<string, { fields?: FieldConfigurationWithDefinition<DefaultComponentProps> }>;
  const compFields = comps?.[compType]?.fields;
  return resolveFieldTypeForPath(compFields, segs);
}

function isNonPrimitive(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

export function useTemplates<T>(props: T, componentId: string = 'root'): T {
  const templatePaths = useGlobalStore(s => s.templateFieldMap[componentId]);
  const connection = useStore(s => s.connection);
  const userConfig = useGlobalStore(s => s.userConfig) as CustomConfigWithDefinition<DefaultComponentProps> | null;

  // 1) Build expressions from known template paths
  const { expressions, keys, emptyKeys } = useMemo(() => {
    if (!templatePaths) {
      return { expressions: [], keys: [], emptyKeys: [] };
    }

    const exprs: string[] = [];
    const keys: string[] = [];
    const emptyKeys: string[] = [];

    for (const rawPath of templatePaths) {
      const flatPath = rawPath.replace(/\/+$/, '');
      const segs = splitPathToSegs(flatPath);
      const value = getAtPath(props as unknown, segs);

      if (!isTemplateString(value)) continue; // stale entry or changed type
      const normalized = normalizeExpression(value);
      if (normalized.length === 0) {
        emptyKeys.push(flatPath);
        continue;
      }
      exprs.push(normalized);
      keys.push(flatPath);
    }

    return { expressions: exprs, keys, emptyKeys };
  }, [props, templatePaths]);

  // 2) Build a single combined template that returns a JSON object keyed by deep path
  const combinedTemplate = useMemo(() => {
    if (expressions.length === 0) return '{}';

    // Build temp variables for each expression using set blocks to allow control structures
    const varDecls = expressions
      .map((expr, idx) => {
        const varName = `__t${idx}`;
        const hasBlock = expr.includes('{%');
        if (hasBlock) {
          // Use the expression as-is inside a set-block
          return `{% set ${varName} %}${expr}{% endset %}`;
        }
        // Simple expression: render via print inside set-block
        return `{% set ${varName} %}{{ (${expr}) }}{% endset %}`;
      })
      .join('\n');

    // Build the final object referencing the temp vars
    const dictEntries = expressions
      .map((_, idx) => {
        const key = keys[idx].split('"').join('\\"');
        return `"${key}": (__t${idx} | default(none))`;
      })
      .join(', ');

    // Full template: declarations + final JSON output
    const template = `${varDecls}\n{{ { ${dictEntries} } | tojson }}`;
    return template;
  }, [expressions, keys]);

  // Only enable remote template evaluation when we actually have expressions to evaluate.
  // Empty template markers should be handled locally without calling the engine.
  const enabled = expressions.length > 0;

  const templateParams = useMemo(
    () => ({ template: combinedTemplate, enabled, report_errors: true, strict: false }),
    [combinedTemplate, enabled]
  );

  // 3) Resolve with a single template call
  const resolvedJson = useTemplate(templateParams);
  console.log('resolvedJson', {
    expressions,
    resolvedJson,
    combinedTemplate,
    templateParams,
    templatePaths,
    enabled,
  });
  // 4) Write resolved values back using per-entry updates, including empty templates
  const resolvedProps = useMemo(() => {
    let next = props as unknown as T;
    let changed = false;

    // Parse mapping only if we actually evaluated a template
    let parsed: Record<string, unknown> = {};
    if (enabled) {
      if (typeof resolvedJson === 'string') {
        const trimmed = resolvedJson.trim();
        // Try to parse as JSON if the engine returned a JSON string; otherwise, treat as non-fatal error
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            parsed = JSON.parse(trimmed) as Record<string, unknown>;
          } catch {
            // Non-fatal: keep parsed as empty
          }
        } else {
          // Non-fatal engine error: do not throw, leave parsed empty so we don't update props
          // console.error(`Template engine error: ${resolvedJson}. Template: ${combinedTemplate}`);
        }
      } else if (resolvedJson && typeof resolvedJson === 'object') {
        parsed = resolvedJson as unknown as Record<string, unknown>;
      }
    }

    // Apply resolved values with type coercion
    for (const [flatKey, value] of Object.entries(parsed)) {
      if (typeof value === 'undefined' || value === null) continue;
      const segs = splitPathToSegs(flatKey);
      const current = getAtPath(next as unknown, segs);
      const shouldForceSet = typeof current === 'string' && current.startsWith(TEMPLATE_PREFIX);
      const expectedType = getExpectedFieldType(userConfig, componentId, flatKey);
      const coercedResult = coerceToTypeStrict(value, expectedType);
      if (!coercedResult.ok) {
        // Skip invalid values rather than crashing the UI
        continue;
      }
      const coerced = coercedResult.value;

      // Deep-equality guard for non-primitives (template returns JSON objects/arrays)
      if (!shouldForceSet) {
        if (!isNonPrimitive(current) && !isNonPrimitive(coerced)) {
          if (Object.is(current, coerced)) continue;
        } else {
          try {
            const a = JSON.stringify(current);
            const b = JSON.stringify(coerced);
            if (a === b) continue;
          } catch {
            if (Object.is(current, coerced)) continue;
          }
        }
      }

      next = setAtPathImmutable(next, segs, coerced);
      changed = true;
    }

    // Clear empty template strings (remove prefix so it doesn't render)
    for (const flatKey of emptyKeys) {
      const segs = splitPathToSegs(flatKey);
      const current = getAtPath(next as unknown, segs);
      if (typeof current === 'string' && current.startsWith(TEMPLATE_PREFIX)) {
        next = setAtPathImmutable(next, segs, '');
        changed = true;
      }
    }

    // Final validation: any templated field still unresolved? replace with empty string
    for (const flatKey of keys) {
      const segs = splitPathToSegs(flatKey);
      const current = getAtPath(next as unknown, segs);
      if (typeof current === 'string' && current.startsWith(TEMPLATE_PREFIX) && connection) {
        next = setAtPathImmutable(next, segs, '');
        changed = true;
      }
    }

    return changed ? next : props;
  }, [resolvedJson, emptyKeys, props, userConfig, componentId, connection, enabled, keys]);

  return resolvedProps;
}
