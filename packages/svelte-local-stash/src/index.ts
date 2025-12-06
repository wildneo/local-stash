import type { StashItem } from '@wildneo/local-stash';
import { get, type Writable, writable } from 'svelte/store';

/**
 * Creates a writable store tied to a StashItem instance.
 * 
 * The store listens for storage events to automatically update its value, and any
 * changes made through the store will be persisted using the StashItem instance.
 *
 * @template TData - The type of data stored in the StashItem instance.
 * @param item - The StashItem instance used for storing data.
 * @returns A writable store tied to the StashItem instance.
 */
export function createStore<TData = unknown>(
  item: StashItem<TData>,
): Writable<TData | null> {
  const store = writable<TData | null>(item.getItem(), (set) => {
    return item.subscribe((event) => set(event.newValue));
  });

  return {
    set: (value: TData | null) => {
      try {
        if (value !== null) {
          item.setItem(value);
        } else {
          item.removeItem();
        }
      } catch (error) {
        console.error(error);
      }
    },

    update(updater: (value: TData | null) => TData | null) {
      try {
        const value = updater(get(store));

        if (value !== null) {
          item.setItem(value);
        } else {
          item.removeItem();
        }
      } catch (error) {
        console.error(error);
      }
    },

    subscribe: store.subscribe,
  };
}
