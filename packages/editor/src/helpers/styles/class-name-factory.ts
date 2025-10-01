import classnames from 'classnames';

type OptionsObj = Record<string, unknown>;
type Options = string | OptionsObj;

export const getGlobalClassName = (rootClass: string, options: Options) => {
  if (typeof options === 'string') {
    return `${rootClass}-${options}`;
  } else {
    const mappedOptions: Options = {};
    for (const option in options) {
      mappedOptions[`${rootClass}--${option}`] = options[option];
    }

    return classnames({
      [rootClass]: true,
      ...mappedOptions,
    });
  }
};

// Generic, strictly-typed factory with CSS Module awareness
/**
 * Build a strictly typed className factory for a CSS Module scope.
 *
 * This utility expects your CSS module to follow a BEM-like naming scheme:
 * - Root class: `${rootClass}` (e.g. Button)
 * - Descendants: `${rootClass}-${descendant}` (e.g. Button-sizeSm)
 * - Modifiers: `${rootClass}--${modifier}` (e.g. Button--primary, Button--loading)
 *
 * With typescript-plugin-css-modules, the `styles` argument is strongly typed,
 * so the factory enforces valid descendant and modifier keys at compile time.
 *
 * Examples
 * const getClassName = getClassNameFactory('Button', styles)
 *
 * // Root only
 * getClassName() -> 'Button'
 * getClassName('Button') -> 'Button'
 *
 * // Descendants (auto-includes root)
 * getClassName('sizeSm') -> 'Button Button-sizeSm'
 *
 * // Modifiers map (auto-includes root)
 * getClassName({ primary: true, loading: isLoading })
 *   -> 'Button Button--primary Button--loading'
 *
 * // Append extra className
 * getClassName({ primary: true }, 'my-extra')
 *   -> 'Button Button--primary my-extra'
 */
export function getClassNameFactory<R extends string, S extends Record<string, string>>(
  rootClass: R,
  styles: S,
  config: { baseClass?: string } = { baseClass: '' }
) {
  type StyleKey = Extract<keyof S, string>;
  type DescendantKey = Extract<StyleKey, `${R}-${string}`>;
  type ModifierKey = Extract<StyleKey, `${R}--${string}`>;
  type DescendantName = DescendantKey extends `${R}-${infer D}` ? D : never;
  type ModifierName = ModifierKey extends `${R}--${infer M}` ? M : never;
  type Modifiers = { [K in ModifierName]?: boolean | string | number | null | undefined } & {
    [K in R]?: boolean | string | number | null | undefined;
  } & { [K in StyleKey]?: boolean | string | number | null | undefined };

  const stylesAny: Record<string, string> = styles as Record<string, string>;
  const rootClassName = stylesAny[rootClass as string] || '';

  const buildFromModifiers = (mods?: Modifiers): string => {
    const prefixed: Record<string, unknown> = {};
    if (mods) {
      (Object.keys(mods) as Array<ModifierName>).forEach(mod => {
        const k = stylesAny[`${rootClass}--${mod}`];
        const base = stylesAny[`${mod}`];
        if (base) {
          return (prefixed[base] = (mods as Record<string, unknown>)[mod as string]);
        }
        if (k) prefixed[k] = (mods as Record<string, unknown>)[mod as string];
      });
    }
    return config.baseClass + classnames(prefixed);
  };

  const buildFromDescendant = (descendant: DescendantName): string => {
    const style = stylesAny[`${rootClass}-${descendant}`] || '';
    return config.baseClass + style;
  };

  const appendExtra = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

  function factory(): string;
  function factory(descendant: DescendantName | R | StyleKey, extraClassName?: string): string;
  function factory(modifiers: Modifiers | undefined, extraClassName?: string): string;
  function factory(arg1?: Modifiers | DescendantName | R | StyleKey, extraClassName?: string): string {
    if (!arg1) return rootClassName;
    if (typeof arg1 === 'string') {
      // Check if it's a descendant class first
      const descendantStyle = stylesAny[`${rootClass}-${arg1}`];
      if (descendantStyle) {
        return appendExtra(config.baseClass + descendantStyle, extraClassName);
      }
      // Otherwise treat as exact match
      const exact = stylesAny[arg1];
      return appendExtra(config.baseClass + (exact || ''), extraClassName);
    }
    if (typeof arg1 === 'object' || typeof arg1 === 'undefined') {
      return appendExtra(buildFromModifiers(arg1), extraClassName);
    }
    return appendExtra(buildFromDescendant(arg1 as DescendantName), extraClassName);
  }

  return factory;
}
