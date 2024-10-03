import { Stash } from "./stash.js";
import type { Options } from "./types.js";

export type { 
  Options,
  PrepareFunction,
  SelectFunction,
  StashListener,
  StorageEvent,
  StashValue,
} from "./types.js";
export { Stash } from "./stash.js";

/**
 * Creates a stash with the provided options.
 *
 * @template TData - The type of data stored in the stash.
 * @param options - The options for configuring the stash.
 * @returns A new stash instance initialized with the provided options.
 */
export function createLocalStash<TData = unknown>(options: Options<TData>) {
  return new Stash<TData>(options);
}
