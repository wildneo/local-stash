import { StashItem } from './item.js';
import { Stash } from './stash.js';
import type { StashItemOptions, StashOptions } from './types.js';

export { createFakeStorage } from './fake.js';
export { StashItem } from './item.js';
export { Stash } from './stash.js';
export type {
  PrepareFunction,
  SelectFunction,
  StashItemOptions,
  StashListener,
  StashOptions,
  StashValue,
  StorageEvent,
} from './types.js';

/**
 * Creates a stash with the provided options.
 *
 * @param options - The options for configuring the stash.
 * @returns A new stash instance initialized with the provided options.
 *
 * @template TData - The type of data stored in the stash.
 */
export function createStash(options: StashOptions) {
  return new Stash(options);
}

/**
 * Creates a stash item with the provided options.
 *
 * @param options - The options for configuring the stash item.
 * @returns A new stash item instance initialized with the provided options.
 *
 * @template TData - The type of data stored in the stash item.
 */
export function createItem<TData = unknown>(options: StashItemOptions<TData>) {
  return new StashItem<TData>(options);
}
