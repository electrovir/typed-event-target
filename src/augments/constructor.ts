/** Transforms a constructor type parameter into a constructed instance of that constructor. */
export type Constructed<ConstructorFunction extends Readonly<new (...args: any[]) => any>> =
    ConstructorFunction extends new (...args: any[]) => infer ConstructorReturnType
        ? ConstructorReturnType
        : never;

export type {Constructor} from 'type-fest';
