import type { StashItem } from '@wildneo/local-stash';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useLayoutEffect, useState } from 'react';
import { resolveValue } from './utils.js';

/**
 * Creates a custom hook for managing local storage state with the provided StashItem instance.
 *
 * @template TData - The type of data stored in the Stash instance.
 * @param item - The StashItem instance used for storing data.
 * @returns A hook that provides access to the stored value and a function to update it.
 */
export function createHook<TData = unknown>(item: StashItem<TData>) {
  const useStashItem = () => {
    const [storedValue, setStoredValue] = useState<TData | null>(() => {
      try {
        return item.getItem();
      } catch (error) {
        console.error(error);
        return null;
      }
    });

    useLayoutEffect(() => {
      // Подписка вызывается ТОЛЬКО когда данные реально изменились
      return item.subscribe((event) => {
        // Просто кладём новое значение, без сравнений
        setStoredValue(event.newValue);
      });
    }, [item]);

    const setValue: Dispatch<SetStateAction<TData | null>> = useCallback(
      (value) => {
        try {
          const newValue = resolveValue(value, item.getItem());
          if (newValue !== null) {
            item.setItem(newValue);
          } else {
            item.removeItem();
          }
        } catch (error) {
          console.error(error);
        }
      },
      [item],
    );

    return [storedValue, setValue] as const;
  };

  return useStashItem;
}
