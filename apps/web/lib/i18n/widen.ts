// A catalog's shape with its English text widened to string and list lengths
// kept: what every other language's catalog has to match.
export type Widen<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [K in keyof T]: Widen<T[K]> }
    : { readonly [K in keyof T]: Widen<T[K]> };
