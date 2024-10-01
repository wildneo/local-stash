import { EventEmitter } from '@wildneo/emitter';
import type { Options, StashListener, StorageEvent } from './types';
import { resolveKey, deserialize, serialize, mergeScopes } from './utils';

/**
 * Represents a Stash that allows storing and managing data.
 *
 * @template TData - The type of data stored in the Stash.
 */
export class Stash<TData = unknown> {
  #options: Options;
  #emitter: EventEmitter;

  constructor(options: Options<TData>) {
    this.#emitter = new EventEmitter();
    this.#options = options;
  }

  /**
   * Retrieves the data associated with the specified key from the storage.
   * If the key is not found, returns null.
   *
   * @param key - The key to retrieve the data for.
   * @returns The data associated with the key, or null if the key is not found.
   */
  getItem(key: string): TData | null {
    const value = this.#options.storage.getItem(resolveKey(key, this.#options.scope));

    if (value === null) return null;

    const stashValue = deserialize(value);

    return this.#options.select
      ? this.#options.select(stashValue.data, stashValue.version)
      : stashValue.data;
  }

  /**
   * Sets the value for the specified key in the storage.
   *
   * @param key - The key to set the value for.
   * @param value - The data value to be stored.
   */
  setItem(key: string, value: TData): void {
    const item = serialize({
      data: this.#options.prepare ? this.#options.prepare(value) : value,
      version: this.#options.version,
    });

    const event: StorageEvent<TData> = {
      oldValue: this.getItem(key),
      newValue: value,
      key,
    }

    this.#options.storage.setItem(resolveKey(key, this.#options.scope), item);

    this.#emitter.emit('storage', event);
  }

  /**
   * Removes the item associated with the specified key from the storage.
   *
   * @param key - The key of the item to be removed.
   */
  removeItem(key: string): void {
    const event: StorageEvent<TData> = {
      oldValue: this.getItem(key),
      newValue: null,
      key,
    }

    this.#options.storage.removeItem(resolveKey(key, this.#options.scope));

    this.#emitter.emit('storage', event);
  }

  /**
   * Registers a listener for the 'storage' event.
   *
   * @param event - The event to listen for, in this case, 'storage'.
   * @param listener - The callback function to be executed when the 'storage' event is emitted.
   * @returns void
   */
  on(event: 'storage', listener: StashListener<TData>): void {
    this.#emitter.on(event, listener);
  }

  /**
   * Unsubscribes a listener from the 'storage' event.
   *
   * @param event - The event to unsubscribe from, in this case, 'storage'.
   * @param listener - The listener function to be removed from the 'storage' event.
   * @returns void
   */
  off(event: 'storage', listener: StashListener<TData>): void {
    this.#emitter.off(event, listener);
  }

  /**
   * Creates a new instance of Stash from the current instance and provided options.
   *
   * @template T - The type of data to be stored in the Stash.
   * @param options - Partial options to configure the Stash instance.
   * @returns A new Stash instance with the merged configuration.
   */

  create<T = TData>(options: Partial<Options<T>>) {
    const scope = mergeScopes(this.#options.scope, options.scope);

    return new Stash<T>({
      ...this.#options,
      ...options,
      scope,
    });
  }
}
