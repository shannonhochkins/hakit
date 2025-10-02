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
  type DescendantModifierKey = Extract<StyleKey, `${R}-${string}--${string}`>;

  // Extract the actual names (without the root prefix)
  type DescendantName = DescendantKey extends `${R}-${infer D}` ? D : never;
  type ModifierName = ModifierKey extends `${R}--${infer M}` ? M : never;

  // Map descendant -> its specific modifier names (e.g. overlay -> 'open' when `${R}-overlay--open` exists)
  type DescendantModifiers<D extends DescendantName> = DescendantModifierKey extends `${R}-${D}--${infer M}` ? M : never;

  // Pairs like 'overlay--open' for standalone modifier object usage
  type DescendantModifierPair = DescendantModifierKey extends `${R}-${infer D}--${infer M}` ? `${D}--${M}` : never;

  // Standalone modifiers (no descendant arg): allow root, descendants, full descendant modifier pairs, and global modifier names
  type StandaloneModifiers = {
    [K in R | DescendantName | DescendantModifierPair | ModifierName]?: boolean | string | number | null | undefined;
  };

  // Combined call with descendant: allow root, descendants, descendant-specific short modifier names, and global modifier names
  type CombinedModifiers<D extends DescendantName> = {
    [K in R | DescendantName | DescendantModifiers<D> | ModifierName]?: boolean | string | number | null | undefined;
  };

  const stylesAny: Record<string, string> = styles as Record<string, string>;
  const rootClassName = stylesAny[rootClass as string] || '';

  const buildFromModifiers = (mods?: Record<string, unknown>, descendantName?: string): string => {
    const prefixed: Record<string, unknown> = {};
    if (mods) {
      Object.keys(mods).forEach(key => {
        const value = (mods as Record<string, unknown>)[key];
        if (value) {
          let matched = false;

          // Check if it's the root class
          if (key === rootClass) {
            prefixed[rootClassName] = true;
            matched = true;
          } else {
            // Check if it's a modifier class (with descendant prefix if provided)
            let modifierClass;
            if (descendantName) {
              // Look for descendant-specific modifier: overlay--open
              modifierClass = stylesAny[`${rootClass}-${descendantName}--${key}`];
            }
            if (!modifierClass) {
              // Look for general modifier: --key
              modifierClass = stylesAny[`${rootClass}--${key}`];
            }
            if (modifierClass) {
              prefixed[modifierClass] = value;
              matched = true;
            }
            // check if it's a descendant class
            const descendantClass = stylesAny[`${rootClass}-${key}`];
            if (descendantClass) {
              prefixed[descendantClass] = value;
              matched = true;
            }
          }

          // Throw error if no match found
          if (!matched) {
            throw new Error(
              `Invalid class name key "${key}" for ${rootClass}. Available keys: ${Object.keys(stylesAny)
                .filter(k => k.startsWith(rootClass))
                .join(', ')}`
            );
          }
        }
      });
    }
    const result = classnames(prefixed);
    return result;
  };

  const buildFromDescendant = (descendant: DescendantName): string => {
    const style = stylesAny[`${rootClass}-${descendant}`];
    if (!style) {
      throw new Error(
        `Invalid descendant class name "${descendant}" for ${rootClass}. Available descendants: ${Object.keys(stylesAny)
          .filter(k => k.startsWith(`${rootClass}-`) && !k.includes('--'))
          .map(k => k.replace(`${rootClass}-`, ''))
          .join(', ')}`
      );
    }
    return config.baseClass + style;
  };

  const appendExtra = (base: string, extra?: string): string => {
    if (!extra) return base;
    if (!base) return extra;
    return `${base} ${extra}`;
  };

  function factory(): string;
  function factory(descendant: DescendantName | R | StyleKey, extraClassName?: string): string;
  function factory(modifiers: StandaloneModifiers | undefined, extraClassName?: string): string;
  function factory<D extends DescendantName>(descendant: D | StyleKey, modifiers: CombinedModifiers<D>, extraClassName?: string): string;
  function factory<D extends DescendantName>(
    arg1?: StandaloneModifiers | DescendantName | R | StyleKey,
    arg2?: string | StandaloneModifiers | CombinedModifiers<D>,
    extraClassName?: string
  ): string {
    if (arg1 === undefined) return rootClassName;
    if (arg1 === null) return rootClassName;

    if (typeof arg1 === 'string') {
      // Check if it's a descendant class first
      const descendantStyle = stylesAny[`${rootClass}-${arg1}`];
      if (descendantStyle) {
        // If second arg is modifiers object, combine them
        if (typeof arg2 === 'object' && arg2 !== null) {
          const baseClass = config.baseClass + descendantStyle;
          const modifierClasses = buildFromModifiers(arg2, arg1);
          const combined = modifierClasses ? baseClass + ' ' + modifierClasses : baseClass;
          return appendExtra(combined, extraClassName);
        }
        // Otherwise treat as extra className
        return appendExtra(config.baseClass + descendantStyle, arg2 as string);
      }
      // Check if it's the root class
      if (arg1 === rootClass) {
        return appendExtra(config.baseClass + rootClassName, arg2 as string);
      }
      // Check if it's an exact match
      const exact = stylesAny[arg1];
      if (exact) {
        return appendExtra(config.baseClass + exact, arg2 as string);
      }
      // Throw error for invalid string key
      throw new Error(
        `Invalid class name key "${arg1}" for ${rootClass}. Available keys: ${Object.keys(stylesAny)
          .filter(k => k.startsWith(rootClass))
          .join(', ')}`
      );
    }

    if (typeof arg1 === 'object' || typeof arg1 === 'undefined') {
      return appendExtra(buildFromModifiers(arg1), arg2 as string);
    }

    return appendExtra(buildFromDescendant(arg1 as DescendantName), arg2 as string);
  }

  return factory;
}
