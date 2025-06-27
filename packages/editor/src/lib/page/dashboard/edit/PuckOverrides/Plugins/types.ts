

export type PropsOf<F> = F extends (props: infer P) => unknown ? P : never;