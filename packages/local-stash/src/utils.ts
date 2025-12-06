/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to maximize compatibility with different types */

import type { StashValue } from './types.js';

export function isStashValue(value: unknown): value is StashValue {
  return value !== null && typeof value === 'object' && 'data' in value;
}

export function resolveStashValue<TData = any>(
  value: TData,
): StashValue<TData> {
  return isStashValue(value) ? value : { data: value };
}

export function resolveKey(key: string, scope: string | undefined) {
  return scope ? `${scope}_${key}` : key;
}

export function serialize(value: unknown) {
  return JSON.stringify(value);
}

export function deserialize<TData = unknown>(
  value: string | null,
): TData | null {
  if (value === null) return null;

  return JSON.parse(value);
}
