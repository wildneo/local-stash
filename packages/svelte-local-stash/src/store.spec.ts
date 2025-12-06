import {
  createFakeStorage,
  createItem,
  createStash,
} from '@wildneo/local-stash';
import { get } from 'svelte/store';
import { describe, expect, test, vi } from 'vitest';
import { createStore } from './index.js';

describe('createStore', () => {
  describe('Initialization', () => {
    test('should return null for non-existent item', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem({ stash, key: 'empty' });
      const store = createStore(item);

      expect(get(store)).toBeNull();
    });

    test('should read existing value from storage', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });

      stash.setItem('existing', 'value');
      const item = createItem({ stash, key: 'existing' });
      const store = createStore(item);

      expect(get(store)).toBe('value');
    });
  });

  describe('set method', () => {
    test('should set value and persist to storage', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem({ stash, key: 'key' });
      const store = createStore(item);

      // Subscribe to activate the store's item subscription
      const unsubscribe = store.subscribe(() => {});

      store.set('new value');

      expect(get(store)).toBe('new value');
      expect(item.getItem()).toBe('new value');

      unsubscribe();
    });

    test('should remove item when set to null', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem({ stash, key: 'key' });
      const store = createStore(item);

      // Subscribe to activate the store's item subscription
      const unsubscribe = store.subscribe(() => {});

      store.set('value');
      expect(get(store)).toBe('value');

      store.set(null);
      expect(get(store)).toBeNull();
      expect(item.getItem()).toBeNull();

      unsubscribe();
    });
  });

  describe('update method', () => {
    test('should update value using updater function', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem<number>({ stash, key: 'counter' });
      const store = createStore(item);

      // Subscribe to activate the store's item subscription
      const unsubscribe = store.subscribe(() => {});

      store.set(10);
      store.update((prev) => (prev ?? 0) + 5);

      expect(get(store)).toBe(15);
      expect(item.getItem()).toBe(15);

      unsubscribe();
    });

    test('should remove item when updater returns null', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem({ stash, key: 'key' });
      const store = createStore(item);

      // Subscribe to activate the store's item subscription
      const unsubscribe = store.subscribe(() => {});

      store.set('value');
      expect(get(store)).toBe('value');

      store.update(() => null);
      expect(get(store)).toBeNull();
      expect(item.getItem()).toBeNull();

      unsubscribe();
    });
  });

  describe('Reactivity and subscriptions', () => {
    test('should react to external changes', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item1 = createItem({ stash, key: 'key' });
      const item2 = createItem({ stash, key: 'key' });
      const store = createStore(item1);

      // Subscribe to activate the store's item subscription
      const unsubscribe = store.subscribe(() => {});

      expect(get(store)).toBeNull();

      item2.setItem('external');
      expect(get(store)).toBe('external');

      item2.removeItem();
      expect(get(store)).toBeNull();

      unsubscribe();
    });

    test('should unsubscribe correctly', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem({ stash, key: 'key' });
      const store = createStore(item);
      const listener = vi.fn();

      const unsubscribe = store.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(null);

      store.set('value1');
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();

      store.set('value2');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    test('should support multiple subscribers', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem({ stash, key: 'key' });
      const store = createStore(item);
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.set('value');

      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledTimes(2);
      expect(listener1).toHaveBeenLastCalledWith('value');
      expect(listener2).toHaveBeenLastCalledWith('value');
    });
  });

  describe('Data types', () => {
    test('should handle complex data types', () => {
      const storage = createFakeStorage();
      const stash = createStash({ storage });
      const item = createItem<{ name: string; items: number[] }>({
        stash,
        key: 'complex',
      });
      const store = createStore(item);

      // Subscribe to activate the store's item subscription
      const unsubscribe = store.subscribe(() => {});

      const data = { name: 'test', items: [1, 2, 3] };
      store.set(data);

      expect(get(store)).toEqual(data);
      expect(item.getItem()).toEqual(data);

      unsubscribe();
    });
  });
});
