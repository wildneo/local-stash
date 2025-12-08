# @wildneo/local-stash

A typed wrapper for working with localStorage and similar synchronous storage APIs in TypeScript.

## Installation

```bash
npm install @wildneo/local-stash
```

## Basic Usage

```typescript
import { createStash, createItem } from '@wildneo/local-stash';

// Create a stash instance with localStorage
const stash = createStash({ storage: localStorage });

// Create a typed item
type UserSettings = {
  theme: 'light' | 'dark';
  fontSize: number;
}

const settingsItem = createItem<UserSettings>({
  stash,
  key: 'user-settings',
});

// Set value
settingsItem.setItem({ theme: 'dark', fontSize: 14 });

// Get value
const settings = settingsItem.getItem();
// settings: UserSettings | null

// Remove value
settingsItem.removeItem();
```

## API

### `createStash(options: StashOptions)`

Creates a new Stash instance.

```typescript
import { createStash } from '@wildneo/local-stash';

const stash = createStash({
  storage: localStorage,
  scope: 'my-app', // optional prefix for all keys
});
```

#### StashOptions

| Option | Type | Description |
|--------|------|-------------|
| `storage` | `Storage` | Storage implementation (localStorage, sessionStorage, or custom) |
| `scope` | `string` | Optional prefix for all keys. Keys will be stored as `{scope}_{key}` |

### `createItem<TData>(options: StashItemOptions)`

Creates a new StashItem instance for a specific key.

```typescript
import { createItem } from '@wildneo/local-stash';

const item = createItem<string>({
  stash,
  key: 'my-key',
});
```

#### StashItemOptions

| Option | Type | Description |
|--------|------|-------------|
| `stash` | `StashInterface` | The Stash instance to use |
| `key` | `string` | The storage key |
| `version` | `number \| string` | Optional version for data migration |
| `select` | `SelectFunction` | Optional function to transform data on read |
| `prepare` | `PrepareFunction` | Optional function to transform data before write |

## Stash Class

Low-level API for direct storage operations.

### Methods

#### `getItem<TData>(key: string): TData | null`

Retrieves data by key.

```typescript
const value = stash.getItem<string>('my-key');
```

#### `setItem(key: string, value: unknown): void`

Stores data by key.

```typescript
stash.setItem('my-key', { foo: 'bar' });
```

#### `removeItem(key: string): void`

Removes data by key.

```typescript
stash.removeItem('my-key');
```

#### `subscribe<TData>(listener: StashListener): UnsubscribeFunction`

Subscribes to all storage changes.

```typescript
const unsubscribe = stash.subscribe<MyData>((event) => {
  console.log('Key:', event.key);
  console.log('Old value:', event.oldValue);
  console.log('New value:', event.newValue);
});

// Later: unsubscribe
unsubscribe();
```

## StashItem Class

High-level API for working with a specific key.

### Methods

#### `getItem(): TData | null`

Retrieves the item's data.

```typescript
const settings = settingsItem.getItem();
```

#### `setItem(value: TData): void`

Stores the item's data.

```typescript
settingsItem.setItem({ theme: 'dark', fontSize: 14 });
```

#### `removeItem(): void`

Removes the item from storage.

```typescript
settingsItem.removeItem();
```

#### `subscribe(listener: StashListener): UnsubscribeFunction`

Subscribes to changes for this specific item.

```typescript
const unsubscribe = settingsItem.subscribe((event) => {
  console.log('Settings changed:', event.newValue);
});
```

## Data Versioning

Use `version`, `select`, and `prepare` options for data migration:

```typescript
type UserSettingsV1 = {
  theme: string;
}

type UserSettingsV2 = {
  theme: 'light' | 'dark';
  fontSize: number;
}

const settingsItem = createItem<UserSettingsV2>({
  stash,
  key: 'user-settings',
  version: 2,
  select: (data, version) => {
    // Migrate from v1 to v2
    if (version === 1) {
      const v1Data = data as UserSettingsV1;
      return {
        theme: v1Data.theme === 'dark' ? 'dark' : 'light',
        fontSize: 14, // default value
      };
    }
    return data as UserSettingsV2;
  },
  prepare: (value) => {
    // Optional: transform before saving
    return value;
  },
});
```

## Runtime Validation with Zod

Since TypeScript types are erased at runtime, data from localStorage may not match your expected types. Use the `select` option with a validation library like [zod](https://github.com/colinhacks/zod) for runtime type safety:

```typescript
import { z } from 'zod';
import { createStash, createItem } from '@wildneo/local-stash';

// Define a schema
const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  fontSize: z.number().min(10).max(24),
});

type UserSettings = z.infer<typeof UserSettingsSchema>;

const stash = createStash({ storage: localStorage });

const settingsItem = createItem<UserSettings>({
  stash,
  key: 'user-settings',
  select: (data) => {
    const result = UserSettingsSchema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    // Return default value if validation fails
    return { theme: 'light', fontSize: 14 };
  },
});

// Now getItem() always returns valid UserSettings or default
const settings = settingsItem.getItem();
```

This approach protects against:
- Corrupted data in storage
- Data modified via browser DevTools
- Schema changes between app versions
- Data from other applications (key collisions)

## Fake Storage

The `createFakeStorage()` utility creates an in-memory Storage implementation.

### Use Cases

#### Testing

```typescript
import { createStash, createFakeStorage } from '@wildneo/local-stash';

// In tests
const stash = createStash({
  storage: createFakeStorage(),
});
```

#### SSR / Server-Side Rendering

When localStorage is not available (e.g., during server-side rendering):

```typescript
import { createStash, createFakeStorage } from '@wildneo/local-stash';

const isBrowser = typeof window !== 'undefined';

const stash = createStash({
  storage: isBrowser ? localStorage : createFakeStorage(),
});
```

## Types

```typescript
// Storage event
type StorageEvent<TData> = {
  key: string | null;
  newValue: TData | null;
  oldValue: TData | null;
};

// Listener function
type StashListener<TData> = (event: StorageEvent<TData>) => void;

// Unsubscribe function
type UnsubscribeFunction = () => void;

// Stored value wrapper
type StashValue<TData> = {
  version?: number | string;
  data: TData;
};

// Select function for data transformation
type SelectFunction<TData> = (
  data: unknown,
  version?: string | number,
) => TData | null;

// Prepare function for data transformation
type PrepareFunction<TData> = (value: TData) => unknown;
```

## License

MIT
