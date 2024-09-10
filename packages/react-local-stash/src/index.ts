import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Stash } from "@wildneo/local-stash";

/**
 * Creates a custom hook for managing local storage state with the provided Stash instance.
 *
 * @template TData - The type of data stored in the Stash instance.
 * @param stash - The Stash instance used for storing data.
 * @returns A hook that provides access to the stored value and a function to update it.
 */
export function createLocalStashHook<TData = unknown>(stash: Stash<TData>) {
  const useLocalStash = (key: string, initialValue: TData) => {
    const [storedValue, setStoredValue] = useState<TData>(() => {
      try {
        const storedValue = stash.getItem(key);

        return storedValue === null ? initialValue : storedValue;
      } catch (error) {
        console.error(error);

        return initialValue;
      }
    });

    useEffect(() => {
      const handler = (value: TData) => setStoredValue(value);

      stash.on("storage", handler);

      return () => {
        stash.off("storage", handler);
      };
    }, []);

    const setValue: Dispatch<SetStateAction<TData>> = useCallback(
      (value) => {
        try {
          const valueToStore =
            value instanceof Function ? value(storedValue) : value;

          stash.setItem(key, valueToStore);
        } catch (error) {
          console.error(error);
        }
      },
      [key, storedValue]
    );

    return [storedValue, setValue] as const;
  };

  return useLocalStash;
}
