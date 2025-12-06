/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to maximize compatibility with different types */
export type Listener = (...args: any[]) => void;
