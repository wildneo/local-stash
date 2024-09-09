import type { StashValue } from './types';

export function isStashValue(value: unknown): value is StashValue {
  return value !== null && typeof value === 'object' && 'data' in value;
}

export function resolveKey(key: string, scope: string | undefined) {
  return scope ? scope + '_' + key : key;
}

export function mergeScopes(...scopes: Array<string | undefined>) {
  return scopes.filter(Boolean).join('_');
}

export function serialize(value: StashValue) {
  return JSON.stringify(value);
}

export function deserialize(value: string): StashValue {
  const parsedValue = JSON.parse(value);

  return isStashValue(parsedValue) ? parsedValue : { data: parsedValue };
}
