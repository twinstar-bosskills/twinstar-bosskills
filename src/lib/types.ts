type F = (...args: any[]) => any;
export type ART<T extends F> = Awaited<ReturnType<T>>;
