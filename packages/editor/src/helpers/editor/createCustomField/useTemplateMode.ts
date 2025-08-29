import { useCallback, useMemo } from 'react';
import type { DefaultComponentProps } from '@measured/puck';
import { EXCLUDE_FIELD_TYPES_FROM_TEMPLATES, TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';
import type { CustomFieldsWithDefinition } from '@typings/fields';
import { useGlobalStore } from '@hooks/useGlobalStore';

type UseTemplateModeParams<Props extends DefaultComponentProps> = {
  field: CustomFieldsWithDefinition<Props>['_field'];
  name: string;
  value: Props;
  repositoryId?: string;
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
  repositoryId,
  onChange,
  componentIdForMap,
}: UseTemplateModeParams<Props>): UseTemplateModeReturn {
  const templatesEnabledByType = !EXCLUDE_FIELD_TYPES_FROM_TEMPLATES.includes(field.type);
  const templatesEnabledByField = field.templates?.enabled !== false;
  const allowTemplates = templatesEnabledByType && templatesEnabledByField;

  const isTemplateValue = useMemo(() => typeof value === 'string' && (value as unknown as string).startsWith(TEMPLATE_PREFIX), [value]);

  const templateFieldMap = useGlobalStore(s => s.templateFieldMap);
  const setTemplateFieldMap = useGlobalStore(s => s.setTemplateFieldMap);

  // Convert a dot-notated name into a path that protects repository ids by using '/'
  const flatPath = useMemo(() => {
    const segs = name.split('.').filter(Boolean);
    const withRepo = repositoryId ? [repositoryId, ...segs] : segs;
    return withRepo.join('/');
  }, [name, repositoryId]);

  const templateMode = useMemo(() => {
    const paths = templateFieldMap[componentIdForMap] ?? [];
    return paths.includes(flatPath) || isTemplateValue;
  }, [templateFieldMap, componentIdForMap, flatPath, isTemplateValue]);

  const handleTemplateToggle = useCallback(
    (enabled: boolean) => {
      // update map
      const { templateFieldMap: currentMap } = useGlobalStore.getState();
      const nextMap = { ...currentMap } as Record<string, string[]>;
      const arr = [...(nextMap[componentIdForMap] ?? [])];
      const idx = arr.indexOf(flatPath);
      if (enabled) {
        if (idx === -1) arr.push(flatPath);
      } else {
        if (idx !== -1) arr.splice(idx, 1);
      }
      nextMap[componentIdForMap] = arr;
      setTemplateFieldMap(nextMap);

      if (enabled) {
        // Reset to empty template marker so it is clearly a templated value
        onChange(TEMPLATE_PREFIX as unknown as Props);
      } else {
        // toggling OFF: revert to default
        let nextValue: unknown = (field as unknown as { default?: unknown }).default;
        if (typeof nextValue === 'undefined') {
          const maybeOptions = (field as unknown as { options?: Array<{ value: unknown }> }).options;
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
    return typeof value === 'string' ? (value as unknown as string).replace(TEMPLATE_PREFIX, '') : '';
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
