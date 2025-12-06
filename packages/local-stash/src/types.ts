/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to maximize compatibility with different types */

/**
 * Defines the interface for a Stash that allows storing and managing data.
 */
export interface StashInterface {
  /**
   * Retrieves the data associated with the specified key from the storage.
   * If the key is not found, returns null.
   *
   * @param key - The key to retrieve the data for.
   * @returns The data associated with the key, or null if the key is not found.
   *
   * @template T - The type of data to be retrieved from the Stash.
   */
  getItem<TData = unknown>(key: string): TData | null;

  /**
   * Sets the value for the specified key in the storage.
   *
   * @param key - The key to set the value for.
   * @param value - The data value to be stored.
   */
  setItem(key: string, value: unknown): void;

  /**
   * Removes the item associated with the specified key from the storage.
   *
   * @param key - The key of the item to be removed.
   */
  removeItem(key: string): void;

  /**
   * Subscribes to changes in the stash.
   *
   * @param listener - The callback function to be executed when the stash changes.
   * @returns A function to unsubscribe from the changes.
   *
   * @template TData - The type of data stored in the stash.
   */
  subscribe<TData = unknown>(
    listener: StashListener<StashValue<TData>>,
  ): UnsubscribeFunction;
}

/**
 * Defines the options for configuring a stash.
 */
export type StashOptions = {
  /** The storage mechanism for the stash. */
  storage: Storage;

  /** The scope of the stash. */
  scope?: string;
};

/**
 * Defines the interface for a Stash Item that allows storing and managing data.
 *
 * @template TData - The type of data stored in the stash item.
 */
export interface StashItemInterface<TData = unknown> {
  /**
   * Retrieves the data associated with the stash item from the storage.
   * If the item is not found, returns null.
   *
   * @returns The data associated with the item, or null if the item is not found.
   */
  getItem(): TData | null;

  /**
   * Sets the value for the stash item in the storage.
   *
   * @param value - The data value to be stored.
   */
  setItem(value: TData): void;

  /**
   * Removes the stash item from the storage.
   */
  removeItem(): void;

  /**
   * Subscribes to changes in the stash item.
   *
   * @param listener - The callback function to be executed when the item changes.
   * @returns A function to unsubscribe from the changes.
   */
  subscribe(listener: StashListener<TData>): UnsubscribeFunction;
}

/**
 * Defines the options for configuring a stash item.
 *
 * @template TData - The type of data stored in the stash.
 */
export type StashItemOptions<TData = any> = {
  /** The stash instance to create the item for. */
  stash: StashInterface;

  /** The key of the stash item. */
  key: string;

  /** Optional function to select data. */
  select?: SelectFunction<TData>;

  /** Optional function to prepare data. */
  prepare?: PrepareFunction<TData>;

  /** The version of the stash data. */
  version?: number | string;
};

/**
 * Defines a function that selects data from a stash.
 *
 * @template TData - The type of data stored in the stash.
 * @param data - The data to select from.
 * @param version - Optional version of the data.
 * @returns The selected data of type TData.
 */
export type SelectFunction<TData = unknown> = (
  data: unknown,
  version?: string | number,
) => TData | null;

/**
 * Defines a function that prepares data for storage in a stash.
 *
 * @template TData - The type of data stored in the stash.
 */
export type PrepareFunction<TData = unknown> = (value: TData) => any;

export type StashListener<TData = unknown> = (
  event: StorageEvent<TData>,
) => void;

export type StorageEvent<TData = unknown> = {
  key: string | null;
  newValue: TData | null;
  oldValue: TData | null;
};

export type StashValue<TData = any> = {
  version?: number | string;
  data: TData;
};

export type UnsubscribeFunction = () => void;
