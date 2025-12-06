import type {
  StashItemInterface,
  StashItemOptions,
  StashListener,
  StashValue,
  StorageEvent,
} from './types.js';
import { resolveStashValue } from './utils.js';

/**
 * Represents a Stash Item that allows storing and managing data.
 */
export class StashItem<TData = unknown> implements StashItemInterface<TData> {
  #options: StashItemOptions;

  constructor(options: StashItemOptions<TData>) {
    this.#options = options;
  }

  getItem(): TData | null {
    const value = this.#options.stash.getItem<TData>(this.#options.key);

    const stashValue = resolveStashValue(value);

    return this.#options.select
      ? this.#options.select(stashValue.data, stashValue.version)
      : stashValue.data;
  }

  setItem(value: TData) {
    const item: StashValue<TData> = {
      data: this.#options.prepare ? this.#options.prepare(value) : value,
      version: this.#options.version,
    };

    this.#options.stash.setItem(this.#options.key, item);
  }

  removeItem() {
    this.#options.stash.removeItem(this.#options.key);
  }

  subscribe(listener: StashListener<TData>) {
    const handler = (stashEvent: StorageEvent<StashValue<TData>>) => {
      if (stashEvent.key !== this.#options.key) return;

      if (this.#options.select) {
        const oldValue = this.#options.select(
          stashEvent.oldValue?.data,
          stashEvent.oldValue?.version,
        );
        const newValue = this.#options.select(
          stashEvent.newValue?.data,
          stashEvent.newValue?.version,
        );

        const event: StorageEvent<TData> = {
          oldValue,
          newValue,
          key: stashEvent.key,
        };

        listener(event);

        return;
      }

      const event: StorageEvent<TData> = {
        oldValue: stashEvent.oldValue?.data ?? null,
        newValue: stashEvent.newValue?.data ?? null,
        key: stashEvent.key,
      };

      listener(event);
    };

    return this.#options.stash.subscribe(handler);
  }
}
