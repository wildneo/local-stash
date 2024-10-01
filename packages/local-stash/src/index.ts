import { Stash } from "./stash";
import type { Options } from "./types";

export type { 
  Options,
  PrepareFunction,
  SelectFunction,
  StashListener,
  StorageEvent,
  StashValue,
} from "./types";
export { Stash } from "./stash";

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
