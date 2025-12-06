import { describe, expect, test, vi } from 'vitest';
import { createFakeStorage } from './fake.js';
import { StashItem } from './item.js';
import { Stash } from './stash.js';

describe('Basic CRUD operations', () => {
  test('should return null for non-existent item', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem({ stash, key: 'nonExistent' });

    expect(item.getItem()).toBeNull();
  });

  test('should set and get item with complex data', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const data = { name: 'test', count: 5, nested: { items: [1, 2, 3] } };
    const item = new StashItem<typeof data>({ stash, key: 'key' });

    item.setItem(data);
    expect(item.getItem()).toEqual(data);
  });

  test('should remove item', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem({ stash, key: 'key' });

    item.setItem('value');
    expect(item.getItem()).toBe('value');

    item.removeItem();
    expect(item.getItem()).toBeNull();
  });
});

describe('Data transformation with prepare and select', () => {
  test('should serialize and deserialize Map using prepare and select', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem<Map<string, number>>({
      stash,
      key: 'map',
      prepare: (map) => Array.from(map.entries()),
      select: (data) => (Array.isArray(data) ? new Map(data) : null),
    });

    item.setItem(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
    );
    const restoredMap = item.getItem();

    expect(restoredMap).toBeInstanceOf(Map);
    expect(restoredMap?.get('a')).toBe(1);
    expect(restoredMap?.get('b')).toBe(2);
  });

  test('should transform data using select based on data structure', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });

    // Simulate old data structure stored directly
    storage.setItem(
      'user',
      JSON.stringify({
        data: { firstName: 'John', lastName: 'Doe' },
      }),
    );

    type OldUser = {
      firstName: string;
      lastName: string;
    };
    type NewUser = {
      fullName: string;
    };

    const isNewFormat = (data: unknown): data is NewUser => {
      return (
        typeof data === 'object' &&
        data !== null &&
        'fullName' in data &&
        typeof data.fullName === 'string'
      );
    };

    const isOldFormat = (data: unknown): data is OldUser => {
      return (
        typeof data === 'object' &&
        data !== null &&
        'firstName' in data &&
        'lastName' in data
      );
    };

    const oldToNew = (data: OldUser): NewUser => {
      return { fullName: `${data.firstName} ${data.lastName}` };
    };

    const item = new StashItem<NewUser>({
      stash,
      key: 'user',
      select: (data) => {
        switch (true) {
          case isOldFormat(data):
            return oldToNew(data);

          case isNewFormat(data):
            return data;

          default:
            return null;
        }
      },
    });

    // Old format data should be transformed to new format
    expect(item.getItem()).toEqual({ fullName: 'John Doe' });
  });
});

describe('Version handling', () => {
  test('should store version in storage', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem({
      stash,
      key: 'key',
      version: 2,
    });

    item.setItem('value');

    const rawValue = storage.getItem('key');
    expect(rawValue).not.toBeNull();
    if (rawValue) {
      const parsed = JSON.parse(rawValue);
      expect(parsed.version).toBe(2);
      expect(parsed.data).toBe('value');
    }
  });

  test('should pass version to select in subscription events', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const selectFn = vi.fn((data: unknown, version?: string | number) => {
      return data !== null ? { value: data, version } : null;
    });

    const item = new StashItem<{ value: unknown; version?: string | number }>({
      stash,
      key: 'key',
      version: 3,
      select: selectFn,
    });

    const listener = vi.fn();
    item.subscribe(listener);
    item.setItem({ value: 'test', version: 3 });

    // In subscription events, select receives data and version from StashValue
    expect(selectFn).toHaveBeenCalledWith({ value: 'test', version: 3 }, 3);
    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.newValue).toEqual({
      value: { value: 'test', version: 3 },
      version: 3,
    });
  });
});

describe('Subscriptions', () => {
  test('should notify on set and remove with oldValue/newValue', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem({ stash, key: 'key' });
    const listener = vi.fn();

    item.subscribe(listener);

    // Set initial value
    item.setItem('first');
    expect(listener).toHaveBeenCalledWith({
      key: 'key',
      oldValue: null,
      newValue: 'first',
    });

    // Update value
    item.setItem('second');
    expect(listener).toHaveBeenCalledWith({
      key: 'key',
      oldValue: 'first',
      newValue: 'second',
    });

    // Remove value
    item.removeItem();
    expect(listener).toHaveBeenCalledWith({
      key: 'key',
      oldValue: 'second',
      newValue: null,
    });

    expect(listener).toHaveBeenCalledTimes(3);
  });

  test('should stop receiving events after unsubscribe', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem({ stash, key: 'key' });
    const listener = vi.fn();

    const unsubscribe = item.subscribe(listener);
    item.setItem('value1');
    unsubscribe();
    item.setItem('value2');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('should filter events by key (isolation)', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item1 = new StashItem({ stash, key: 'key1' });
    const item2 = new StashItem({ stash, key: 'key2' });
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    item1.subscribe(listener1);
    item2.subscribe(listener2);

    item1.setItem('value1');
    item2.setItem('value2');
    item1.setItem('value1-updated');

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener1.mock.calls.every((call) => call[0].key === 'key1')).toBe(
      true,
    );
    expect(listener2.mock.calls.every((call) => call[0].key === 'key2')).toBe(
      true,
    );
  });

  test('should apply select to subscription events', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem<Map<string, number>>({
      stash,
      key: 'key',
      select: (data) => (Array.isArray(data) ? new Map(data) : null),
      prepare: (data) => Array.from(data.entries()),
    });
    const listener = vi.fn();

    item.subscribe(listener);
    item.setItem(new Map([['x', 10]]));

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.newValue).toBeInstanceOf(Map);
    expect((event.newValue as Map<string, number>).get('x')).toBe(10);
  });

  test('should support multiple subscribers', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const item = new StashItem({ stash, key: 'key' });
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    item.subscribe(listener1);
    item.subscribe(listener2);
    item.setItem('value');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});
