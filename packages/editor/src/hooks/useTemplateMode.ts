import { useCallback, useMemo } from 'react';
import type { DefaultComponentProps } from '@measured/puck';
import { EXCLUDE_FIELD_TYPES_FROM_TEMPLATES, TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';
import { isBreakpointObject } from '@helpers/editor/pageData/isBreakpointObject';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { getResolvedBreakpointValue } from '@helpers/editor/pageData/getResolvedBreakpointValue';
import { FieldConfiguration, FieldTypes } from '@typings/fields';

type UseTemplateModeParams<Props extends DefaultComponentProps> = {
  field: FieldConfiguration[string];
  name: string;
  value: Props;
  addonId?: string;
  onChange: (value: Props) => void;
  componentIdForMap: string;
};

type UseTemplateModeReturn = {
  allowTemplates: boolean;
  templateMode: boolean;
  handleTemplateToggle: (enabled: boolean) => void;
  templateInputValue: string;
  onTemplateInputChange: (value: string) => void;
};

export function useTemplateMode<Props extends DefaultComponentProps>({
  field,
  name,
  value,
  addonId,
  onChange,
  componentIdForMap,
}: UseTemplateModeParams<Props>): UseTemplateModeReturn {
  const fieldType = 'metadata' in field ? (field.metadata?.type as FieldTypes) : field.type;
  const templatesEnabledByType = !EXCLUDE_FIELD_TYPES_FROM_TEMPLATES.includes(fieldType);
  // Default to enabled when a field doesn't specify a 'templates' config
  const templatesEnabledByField = !('templates' in field) || field.templates?.enabled !== false;
  const allowTemplates = templatesEnabledByType && templatesEnabledByField;

  // Remove precomputed template flag; resolve inline below

  const templateFieldMap = useGlobalStore(s => s.templateFieldMap);
  const setTemplateFieldMap = useGlobalStore(s => s.setTemplateFieldMap);
  const activeBreakpoint = useGlobalStore(s => s.activeBreakpoint);

  // No dependency on breakpoint config; we compute deterministically from value + active breakpoint

  // Build a dot-notated path (matches templateFieldMap keys from computeTemplateFieldMap)
  const flatPath = useMemo(() => {
    if (!name) {
      return undefined;
    }
    const segs = name.split('.').filter(Boolean);
    const withRepo = addonId ? [addonId, ...segs] : segs;
    const fp = withRepo.join('.');
    return fp;
  }, [name, addonId]);

  const templateMode = useMemo(() => {
    if (!flatPath) return false;
    const paths = templateFieldMap[componentIdForMap] ?? [];
    if (paths.includes(flatPath)) return true;

    const current: unknown = value as unknown;
    // Direct string template
    if (typeof current === 'string') return current.startsWith(TEMPLATE_PREFIX);

    // Breakpoint object: resolve for active breakpoint then test
    if (current && typeof current === 'object' && isBreakpointObject(current)) {
      const resolved = getResolvedBreakpointValue(current, activeBreakpoint);
      if (typeof resolved === 'string') return resolved.startsWith(TEMPLATE_PREFIX);
      // If resolved is non-string but any key is prefixed, still consider templated
      for (const v of Object.values(current)) {
        if (typeof v === 'string' && v.startsWith(TEMPLATE_PREFIX)) return true;
      }
    }
    return false;
  }, [templateFieldMap, componentIdForMap, flatPath, activeBreakpoint, value]);

  const handleTemplateToggle = useCallback(
    (enabled: boolean) => {
      // update map when we have a stable path; otherwise, still update the value
      if (flatPath) {
        const { templateFieldMap: currentMap } = useGlobalStore.getState();
        const nextMap = { ...currentMap };
        const arr = [...(nextMap[componentIdForMap] ?? [])];
        const idx = arr.indexOf(flatPath);
        if (enabled) {
          if (idx === -1) arr.push(flatPath);
        } else {
          if (idx !== -1) arr.splice(idx, 1);
        }
        nextMap[componentIdForMap] = arr;
        setTemplateFieldMap(nextMap);
      }

      if (enabled) {
        // Reset to empty template marker so it is clearly a templated value
        onChange(TEMPLATE_PREFIX as unknown as Props);
      } else {
        // toggling OFF: revert to default
        let nextValue: unknown = 'default' in field ? field.default : undefined;
        if (typeof nextValue === 'undefined') {
          const maybeOptions = 'options' in field ? field.options : undefined;
          if (Array.isArray(maybeOptions) && maybeOptions.length > 0) {
            nextValue = maybeOptions[0]?.value;
          }
        }
        onChange(nextValue as Props);
      }
    },
    [setTemplateFieldMap, componentIdForMap, flatPath, field, onChange]
  );

  const templateInputValue = useMemo(() => {
    const v = typeof value === 'string' ? (value as unknown as string).replace(TEMPLATE_PREFIX, '') : '';
    return v;
  }, [value]);

  const onTemplateInputChange = useCallback(
    (val: string) => {
      onChange(`${TEMPLATE_PREFIX}${val}` as unknown as Props);
    },
    [onChange]
  );

  return {
    allowTemplates,
    templateMode,
    handleTemplateToggle,
    templateInputValue,
    onTemplateInputChange,
  };
}
