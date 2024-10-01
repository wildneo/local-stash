import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Stash, type StashListener } from "@wildneo/local-stash";
import { resolveValue } from "./utils";

/**
 * Creates a custom hook for managing local storage state with the provided Stash instance.
 *
 * @template TData - The type of data stored in the Stash instance.
 * @param stash - The Stash instance used for storing data.
 * @returns A hook that provides access to the stored value and a function to update it.
 */
export function createLocalStashHook<TData = unknown>(stash: Stash<TData>) {
  const useLocalStash = (key: string, initialValue: TData | (() => TData)) => {
    const [storedValue, setStoredValue] = useState<TData | null>(() => {
      try {
        const storedValue = stash.getItem(key);

        return storedValue === null ? resolveValue(initialValue) : storedValue;
      } catch (error) {
        console.error(error);

        return resolveValue(initialValue);
      }
    });

    useEffect(() => {
      const listener: StashListener<TData> = (event) => {
        if (event.key !== key) return;

        setStoredValue(event.newValue);
      };

      stash.on("storage", listener);

      return () => {
        stash.off("storage", listener);
      };
    }, []);

    const setValue: Dispatch<SetStateAction<TData | null>> = useCallback(
      (value) => {
        try {
          const valueToStore = resolveValue(value, storedValue);

          if (valueToStore !== null) {
            stash.setItem(key, valueToStore);
          } else {
            stash.removeItem(key);
          }

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
