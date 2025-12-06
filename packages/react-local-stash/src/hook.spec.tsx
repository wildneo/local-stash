import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createFakeStorage,
  createItem,
  createStash,
} from '@wildneo/local-stash';
import { describe, expect, test } from 'vitest';
import { createHook } from './index.js';

describe('createHook', () => {
  test('should return null for non-existent item and read existing value', () => {
    const storage = createFakeStorage();
    const stash = createStash({ storage });

    const emptyItem = createItem({ stash, key: 'empty' });
    const useEmptyItem = createHook(emptyItem);
    const { result: emptyResult } = renderHook(() => useEmptyItem());
    expect(emptyResult.current[0]).toBeNull();

    stash.setItem('existing', 'value');
    const existingItem = createItem({ stash, key: 'existing' });
    const useExistingItem = createHook(existingItem);
    const { result: existingResult } = renderHook(() => useExistingItem());
    expect(existingResult.current[0]).toBe('value');
  });

  test('should set and remove item value', async () => {
    const storage = createFakeStorage();
    const stash = createStash({ storage });
    const item = createItem({ stash, key: 'key' });
    const useStashItem = createHook(item);

    const { result } = renderHook(() => useStashItem());
    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]('value');
    });
    await waitFor(() => {
      expect(result.current[0]).toBe('value');
    });
    expect(item.getItem()).toBe('value');

    act(() => {
      result.current[1](null);
    });
    await waitFor(() => {
      expect(result.current[0]).toBeNull();
    });
    expect(item.getItem()).toBeNull();
  });

  test('should react to external changes', async () => {
    const storage = createFakeStorage();
    const stash = createStash({ storage });
    const item1 = createItem({ stash, key: 'key' });
    const item2 = createItem({ stash, key: 'key' });
    const useStashItem = createHook(item1);

    const { result } = renderHook(() => useStashItem());
    expect(result.current[0]).toBeNull();

    act(() => {
      item2.setItem('external');
    });
    await waitFor(() => {
      expect(result.current[0]).toBe('external');
    });

    act(() => {
      item2.removeItem();
    });
    await waitFor(() => {
      expect(result.current[0]).toBeNull();
    });
  });

  test('should support functional updates', async () => {
    const storage = createFakeStorage();
    const stash = createStash({ storage });
    const item = createItem<number>({ stash, key: 'counter' });
    const useStashItem = createHook(item);

    const { result } = renderHook(() => useStashItem());
    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]((prev) => (prev ?? 0) + 10);
    });
    await waitFor(() => {
      expect(result.current[0]).toBe(10);
    });

    act(() => {
      result.current[1]((prev) => (prev ?? 0) + 5);
    });
    await waitFor(() => {
      expect(result.current[0]).toBe(15);
    });
  });

  test('should unsubscribe on unmount', () => {
    const storage = createFakeStorage();
    const stash = createStash({ storage });
    const item = createItem({ stash, key: 'key' });
    const useStashItem = createHook(item);

    const { result, unmount } = renderHook(() => useStashItem());
    expect(result.current[0]).toBeNull();

    unmount();

    item.setItem('value');
    expect(item.getItem()).toBe('value');
  });

  test('should handle complex data types', async () => {
    const storage = createFakeStorage();
    const stash = createStash({ storage });
    const item = createItem<{ name: string; items: number[] }>({
      stash,
      key: 'complex',
    });
    const useStashItem = createHook(item);

    const { result } = renderHook(() => useStashItem());

    const data = { name: 'test', items: [1, 2, 3] };
    act(() => {
      result.current[1](data);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(data);
    });
  });
});
