import { describe, expect, test, vi } from 'vitest';
import { createFakeStorage } from './fake.js';
import { Stash } from './stash.js';

describe('CRUD Operations', () => {
  test('getItem returns null for non-existent key', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });

    expect(stash.getItem('nonExistent')).toBeNull();
  });

  test('setItem/getItem works with different data types', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });

    // string
    stash.setItem('string', 'value');
    expect(stash.getItem('string')).toBe('value');

    // number
    stash.setItem('number', 42);
    expect(stash.getItem<number>('number')).toBe(42);

    // boolean
    stash.setItem('bool', true);
    expect(stash.getItem<boolean>('bool')).toBe(true);

    // null
    stash.setItem('nullValue', null);
    expect(stash.getItem('nullValue')).toBeNull();

    // object
    const obj = { name: 'test', count: 5 };
    stash.setItem('object', obj);
    expect(stash.getItem<typeof obj>('object')).toEqual(obj);

    // array
    const arr = [1, 2, 3, 'test'];
    stash.setItem('array', arr);
    expect(stash.getItem<typeof arr>('array')).toEqual(arr);

    // nested object
    const complex = {
      nested: { deep: { value: 'test' } },
      array: [{ id: 1 }, { id: 2 }],
    };
    stash.setItem('complex', complex);
    expect(stash.getItem<typeof complex>('complex')).toEqual(complex);
  });

  test('removeItem deletes item from storage', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });

    stash.setItem('key', 'value');
    expect(stash.getItem('key')).toBe('value');

    stash.removeItem('key');
    expect(stash.getItem('key')).toBeNull();

    // removing non-existent item should not throw
    expect(() => stash.removeItem('nonExistent')).not.toThrow();
  });
});

describe('Scope Isolation', () => {
  test('scope adds prefix to keys in storage', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage, scope: 'myScope' });

    stash.setItem('key', 'value');

    // raw storage has prefixed key
    expect(storage.getItem('myScope_key')).toBe('{"data":"value"}');
    // stash returns value without prefix knowledge
    expect(stash.getItem('key')).toBe('value');
  });

  test('different scopes isolate data', () => {
    const storage = createFakeStorage();
    const stash1 = new Stash({ storage, scope: 'scope1' });
    const stash2 = new Stash({ storage, scope: 'scope2' });

    stash1.setItem('key', 'value1');
    stash2.setItem('key', 'value2');

    expect(stash1.getItem('key')).toBe('value1');
    expect(stash2.getItem('key')).toBe('value2');
  });
});

describe('Subscribe', () => {
  test('subscribe is called on setItem with correct event', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const listener = vi.fn();

    stash.subscribe(listener);
    stash.setItem('key', 'value');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      key: 'key',
      oldValue: { data: null },
      newValue: { data: 'value' },
    });
  });

  test('subscribe is called on removeItem', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const listener = vi.fn();

    stash.setItem('key', 'value');
    stash.subscribe(listener);
    stash.removeItem('key');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      key: 'key',
      oldValue: { data: 'value' },
      newValue: null,
    });
  });

  test('unsubscribe stops receiving events', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const listener = vi.fn();

    const unsubscribe = stash.subscribe(listener);
    stash.setItem('key1', 'value1');
    unsubscribe();
    stash.setItem('key2', 'value2');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('multiple subscribers receive events', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    stash.subscribe(listener1);
    stash.subscribe(listener2);
    stash.setItem('key', 'value');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});

describe('Events and Values', () => {
  test('event contains correct oldValue/newValue on update', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const listener = vi.fn();

    stash.setItem('key', 'old');
    stash.subscribe(listener);
    stash.setItem('key', 'new');

    expect(listener).toHaveBeenCalledWith({
      key: 'key',
      oldValue: { data: 'old' },
      newValue: { data: 'new' },
    });
  });

  test('StashValue format is handled correctly', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });

    // when setting a StashValue object, data should be extracted
    const stashValue = { version: 1, data: 'test' };
    stash.setItem('key', stashValue);
    expect(stash.getItem('key')).toBe('test');
  });

  test('sequence of operations generates correct events', () => {
    const storage = createFakeStorage();
    const stash = new Stash({ storage });
    const listener = vi.fn();

    stash.subscribe(listener);
    stash.setItem('key', 'value1');
    stash.setItem('key', 'value2');
    stash.removeItem('key');

    expect(listener).toHaveBeenCalledTimes(3);

    expect(listener.mock.calls[0][0]).toEqual({
      key: 'key',
      oldValue: { data: null },
      newValue: { data: 'value1' },
    });

    expect(listener.mock.calls[1][0]).toEqual({
      key: 'key',
      oldValue: { data: 'value1' },
      newValue: { data: 'value2' },
    });

    expect(listener.mock.calls[2][0]).toEqual({
      key: 'key',
      oldValue: { data: 'value2' },
      newValue: null,
    });
  });
});
