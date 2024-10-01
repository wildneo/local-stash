/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Defines the options for configuring a stash.
 *
 * @template TData - The type of data stored in the stash.
 */
export interface Options<TData = any> {
  /** The storage mechanism for the stash. */
  storage: Storage;

  /** Optional function to select data. */
  select?: SelectFunction<TData>;

  /** Optional function to prepare data. */
  prepare?: PrepareFunction<TData>;

  /** The version of the stash data. */
  version?: number | string;

  /** The scope of the stash. */
  scope?: string;
}

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
  version?: string | number
) => TData;

/**
 * Defines a function that prepares data for storage in a stash.
 *
 * @template TData - The type of data stored in the stash.
 */
export type PrepareFunction<TData = unknown> = (value: TData) => any;

export type StashListener<TData> = (event: StorageEvent<TData>) => void;

export type StorageEvent<TData> = {
  key: string | null;
  newValue: TData | null;
  oldValue: TData | null;
};

export type StashValue = {
  version?: number | string;
  data: any;
};
