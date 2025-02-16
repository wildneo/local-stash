import { type Stash, type StashListener } from '@wildneo/local-stash';
import { get, writable, type Writable } from 'svelte/store';

/**
 * Creates a local storage-backed writable store.
 *
 * This function returns a store creator that synchronizes a Svelte writable store with the provided
 * storage interface. The store listens for storage events to automatically update its value, and any
 * changes made through the store will be persisted using the storage API.
 *
 * @template TData - The type of data stored in the Stash instance.
 * @param stash - A typed storage interface for managing data.
 * @returns A function that creates a writable store tied to a specified key and initial value.
 */
export function createLocalStashStore<TData = unknown>(stash: Stash<TData>) {
	const localStashStore = (key: string, initialValue: TData | null): Writable<TData | null> => {
		const store = writable<TData | null>(initialValue, (setStoredValue) => {
			const stashValue = stash.getItem(key);

			if (stashValue !== null) setStoredValue(stashValue);

			const listener: StashListener<TData> = (event) => {
				if (event.key !== key) return;

				setStoredValue(event.newValue);
			};

			stash.on('storage', listener);

			return () => {
				stash.off('storage', listener);
			};
		});

		return {
			set: (value: TData) => {
				try {
					if (value !== null) {
						stash.setItem(key, value);
					} else {
						stash.removeItem(key);
					}
				} catch (error) {
					console.error(error);
				}
			},
			update(updater: (value: TData | null) => TData | null) {
				try {
					const valueToStore = updater(get(store));

					if (valueToStore !== null) {
						stash.setItem(key, valueToStore);
					} else {
						stash.removeItem(key);
					}
				} catch (error) {
					console.error(error);
				}
			},
			subscribe: store.subscribe,
		};
	};

	return localStashStore;
}