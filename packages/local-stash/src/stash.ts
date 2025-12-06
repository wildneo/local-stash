import { EventEmitter } from '@wildneo/emitter';
import type {
  StashInterface,
  StashListener,
  StashOptions,
  StashValue,
  StorageEvent,
} from './types.js';
import {
  deserialize,
  resolveKey,
  resolveStashValue,
  serialize,
} from './utils.js';

/**
 * Represents a Stash that allows storing and managing data.
 */
export class Stash implements StashInterface {
  #options: StashOptions;
  #emitter: EventEmitter;

  constructor(options: StashOptions) {
    this.#emitter = new EventEmitter();
    this.#options = options;
  }

  #getStashValue<TData = unknown>(key: string) {
    const rawValue = this.#options.storage.getItem(
      resolveKey(key, this.#options.scope),
    );

    return resolveStashValue(deserialize<TData>(rawValue));
  }

  getItem<TData = unknown>(key: string) {
    const stashValue = this.#getStashValue<TData>(key);

    return stashValue.data;
  }

  setItem(key: string, value: unknown) {
    const newValue = resolveStashValue(value);
    const oldValue = this.#getStashValue(key);

    const stashValue = serialize(newValue);

    const event: StorageEvent = {
      oldValue: oldValue,
      newValue: newValue,
      key,
    };

    this.#options.storage.setItem(
      resolveKey(key, this.#options.scope),
      stashValue,
    );

    this.#emitter.emit('stash', event);
  }

  removeItem(key: string) {
    const oldValue = this.#getStashValue(key);

    const event: StorageEvent<StashValue> = {
      oldValue: oldValue,
      newValue: null,
      key,
    };

    this.#options.storage.removeItem(resolveKey(key, this.#options.scope));

    this.#emitter.emit('stash', event);
  }

  subscribe<TData = unknown>(listener: StashListener<StashValue<TData>>) {
    this.#emitter.on('stash', listener);

    return () => {
      this.#emitter.off('stash', listener);
    };
  }
}
