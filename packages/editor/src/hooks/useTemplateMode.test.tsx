import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { createModuleMocker } from '../test-utils/moduleMocker';
import { TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';
import { useTemplateMode } from './useTemplateMode';
// Note: actual import not used; the module is mocked via moduleMocker below
import { FieldConfiguration } from '@typings/fields';
import { DefaultComponentProps } from '@measured/puck';

const moduleMocker = createModuleMocker();

type Value = DefaultComponentProps | string | boolean | Record<string, unknown>;

type SetupParams = {
  field: FieldConfiguration[string];
  name: string;
  value: Value;
  addonId?: string;
  onChange?: (v: Value) => void;
  componentIdForMap: string;
};

function mockUseGlobalStore(initial: Record<string, string[]> = {}, initialBp: string = 'xlg') {
  let templateFieldMap: Record<string, string[]> = { ...initial };
  let activeBreakpoint: string = initialBp;
  const setTemplateFieldMap = (map: Record<string, string[]>) => {
    templateFieldMap = map;
  };
  const setActiveBreakpoint = (bp: string) => {
    activeBreakpoint = bp;
  };
  function useGlobalStore<T>(
    selector: (s: {
      templateFieldMap: Record<string, string[]>;
      setTemplateFieldMap: (m: Record<string, string[]>) => void;
      activeBreakpoint: string;
      setActiveBreakpoint: (bp: string) => void;
    }) => T
  ): T {
    return selector({ templateFieldMap, setTemplateFieldMap, activeBreakpoint, setActiveBreakpoint });
  }
  (
    useGlobalStore as {
      getState?: () => {
        templateFieldMap: Record<string, string[]>;
        setTemplateFieldMap: (m: Record<string, string[]>) => void;
        activeBreakpoint: string;
        setActiveBreakpoint: (bp: string) => void;
      };
    }
  ).getState = () => ({ templateFieldMap, setTemplateFieldMap, activeBreakpoint, setActiveBreakpoint });
  return { useGlobalStore };
}

describe('useTemplateMode', () => {
  beforeAll(async () => {
    await moduleMocker.mock('@hooks/useGlobalStore', () => mockUseGlobalStore());
    await moduleMocker.mock('@hooks/useFieldBreakpointConfig', () => ({
      useFieldBreakpointConfig: () => ({
        responsiveMode: true,
        isBreakpointModeEnabled: true,
        toggleBreakpointMode: () => true,
      }),
    }));
    await moduleMocker.mock('@measured/puck', () => ({
      useGetPuck: () => () => ({ selectedItem: null, appState: { data: { root: { props: { id: 'root' } } } } }),
    }));
  });

  beforeEach(async () => {
    await moduleMocker.mock('@hooks/useGlobalStore', () => mockUseGlobalStore({}, 'xlg'));
    await moduleMocker.mock('@hooks/useFieldBreakpointConfig', () => ({
      useFieldBreakpointConfig: () => ({
        responsiveMode: true,
        isBreakpointModeEnabled: true,
        toggleBreakpointMode: () => true,
      }),
    }));
    await moduleMocker.mock('@measured/puck', () => ({
      useGetPuck: () => () => ({ selectedItem: null, appState: { data: { root: { props: { id: 'root' } } } } }),
    }));
  });

  const boolField: FieldConfiguration['switch'] = { type: 'switch', default: false, label: 'Switch' };
  const textField: FieldConfiguration['text'] = { type: 'text', default: '', label: 'Text' };

  function setup(params: SetupParams) {
    const changes: Array<Value> = [];
    const onChange = (v: Value) => changes.push(v);
    const hook = renderHook(() =>
      useTemplateMode({
        field: params.field,
        name: params.name,
        // @ts-expect-error this is fine, just a test
        value: params.value,
        addonId: params.addonId,
        onChange: onChange,
        componentIdForMap: params.componentIdForMap,
      })
    );
    return { hook, changes } as const;
  }

  it('allowTemplates defaults to true when field.templates is missing', () => {
    const { hook } = setup({ field: boolField, name: 'x.y', value: false, componentIdForMap: 'root' });
    expect(hook.result.current.allowTemplates).toBe(true);
  });

  it('allowTemplates false when field.templates.enabled === false', () => {
    const disabled: FieldConfiguration['switch'] = { ...boolField, templates: { enabled: false } };
    const { hook } = setup({ field: disabled, name: 'x.y', value: false, componentIdForMap: 'root' });
    expect(hook.result.current.allowTemplates).toBe(false);
  });

  it('allowTemplates true when field.templates.enabled === true', () => {
    const disabled: FieldConfiguration['switch'] = { ...boolField, templates: { enabled: true } };
    const { hook } = setup({ field: disabled, name: 'x.y', value: false, componentIdForMap: 'root' });
    expect(hook.result.current.allowTemplates).toBe(true);
  });

  it('templateMode true when value is already a template string', () => {
    const { hook } = setup({ field: textField, name: 'x.y', value: TEMPLATE_PREFIX, componentIdForMap: 'root' });
    expect(hook.result.current.templateMode).toBe(true);
  });

  it('templateMode true when active breakpoint value is templated (breakpoint object)', () => {
    const bpValue = { $xlg: `${TEMPLATE_PREFIX}x`, $md: '' };
    const { hook } = setup({ field: textField, name: 'x.y', value: bpValue, componentIdForMap: 'root' });
    expect(hook.result.current.templateMode).toBe(true);
  });

  it('templateMode true when MD is active and only $md is templated', async () => {
    await moduleMocker.mock('@hooks/useGlobalStore', () => mockUseGlobalStore({}, 'md'));
    const bpValue = { $xlg: '', $md: `${TEMPLATE_PREFIX}md`, $sm: '' };
    const { hook } = setup({ field: textField, name: 'y.z', value: bpValue, componentIdForMap: 'root' });
    expect(hook.result.current.templateMode).toBe(true);
  });

  it('templateMode true when SM is active and only $sm is templated', async () => {
    await moduleMocker.mock('@hooks/useGlobalStore', () => mockUseGlobalStore({}, 'sm'));
    const bpValue = { $xlg: '', $md: '', $sm: `${TEMPLATE_PREFIX}sm` };
    const { hook } = setup({ field: textField, name: 'y.z', value: bpValue, componentIdForMap: 'root' });
    expect(hook.result.current.templateMode).toBe(true);
  });

  it('templateMode false when any breakpoint templated even if active not templated', async () => {
    await moduleMocker.mock('@hooks/useGlobalStore', () => mockUseGlobalStore({}, 'md'));
    const bpValue = { $xlg: `${TEMPLATE_PREFIX}x`, $md: '', $sm: '' };
    const { hook } = setup({ field: textField, name: 'y.z', value: bpValue, componentIdForMap: 'root' });
    expect(hook.result.current.templateMode).toBe(false);
  });

  it('templateMode false when no breakpoint templated and map not set', async () => {
    await moduleMocker.mock('@hooks/useGlobalStore', () => mockUseGlobalStore({}, 'xlg'));
    const bpValue = { $xlg: '', $md: '', $sm: '' };
    const { hook } = setup({ field: textField, name: 'y.z', value: bpValue, componentIdForMap: 'root' });
    expect(hook.result.current.templateMode).toBe(false);
  });

  it('flatPath uses dot-notation with addon id; toggle on then supply value -> templateMode true', () => {
    const { hook, changes } = setup({
      field: boolField,
      name: 'background.useBackgroundImage',
      value: false,
      addonId: '@hakit/default-root',
      componentIdForMap: 'root',
    });
    act(() => hook.result.current.handleTemplateToggle(true));
    const nextVal = changes.at(-1);
    const { result } = renderHook(() =>
      useTemplateMode({
        field: boolField,
        name: 'background.useBackgroundImage',
        value: nextVal as unknown as DefaultComponentProps,
        addonId: '@hakit/default-root',
        onChange: () => {},
        componentIdForMap: 'root',
      })
    );
    expect(result.current.templateMode).toBe(true);
  });

  it('toggle on sets value to TEMPLATE_PREFIX; after supply, templateMode is true', () => {
    const { hook, changes } = setup({ field: boolField, name: 'a.b', value: false, componentIdForMap: 'root' });
    act(() => hook.result.current.handleTemplateToggle(true));
    expect(changes.at(-1)).toBe(TEMPLATE_PREFIX);
    const nextVal = changes.at(-1) as string;
    const { result } = renderHook(() =>
      // @ts-expect-error see note above
      useTemplateMode({ field: boolField, name: 'a.b', value: nextVal, onChange: () => {}, componentIdForMap: 'root' })
    );
    expect(result.current.templateMode).toBe(true);
  });

  it('toggle off resets to field.default; after supply, templateMode is false (text field default)', () => {
    const { hook, changes } = setup({ field: textField, name: 'a.b', value: TEMPLATE_PREFIX, componentIdForMap: 'root' });
    act(() => hook.result.current.handleTemplateToggle(false));
    expect(changes.at(-1)).toBe('');
    const nextVal = changes.at(-1) as string;
    const { result } = renderHook(() =>
      // @ts-expect-error see note above
      useTemplateMode({ field: textField, name: 'a.b', value: nextVal, onChange: () => {}, componentIdForMap: 'root' })
    );
    expect(result.current.templateMode).toBe(false);
  });

  it('when flatPath missing (empty name) toggle still sets value; templateMode remains false due to missing path', () => {
    const { hook, changes } = setup({ field: textField, name: '', value: '', componentIdForMap: 'root' });
    act(() => hook.result.current.handleTemplateToggle(true));
    expect(changes.at(-1)).toBe(TEMPLATE_PREFIX);
    const nextVal = changes.at(-1) as string;
    const { result } = renderHook(() =>
      useTemplateMode({
        field: textField,
        name: '',
        value: nextVal as unknown as DefaultComponentProps,
        onChange: () => {},
        componentIdForMap: 'root',
      })
    );
    expect(result.current.templateMode).toBe(false);
  });

  it('templateInputValue strips prefix and onTemplateInputChange re-prefixes', () => {
    const { hook, changes } = setup({ field: textField, name: 'x.y', value: `${TEMPLATE_PREFIX}abc`, componentIdForMap: 'root' });
    expect(hook.result.current.templateInputValue).toBe('abc');
    act(() => hook.result.current.onTemplateInputChange('world'));
    expect(changes.at(-1)).toBe(`${TEMPLATE_PREFIX}world`);
  });
});
