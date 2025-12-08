# @wildneo/react-local-stash

React hook adapter for [@wildneo/local-stash](https://www.npmjs.com/package/@wildneo/local-stash).

## Installation

```bash
npm install @wildneo/local-stash @wildneo/react-local-stash
```

## Peer Dependencies

- `react` ^18 || ^19
- `@wildneo/local-stash`

## Usage

### Creating a Hook

```typescript
import { createStash, createItem } from '@wildneo/local-stash';
import { createHook } from '@wildneo/react-local-stash';

// Create stash and item
const stash = createStash({ storage: localStorage });

type UserSettings = {
  theme: 'light' | 'dark';
  fontSize: number;
}

const settingsItem = createItem<UserSettings>({
  stash,
  key: 'user-settings',
});

// Create a hook for this item
export const useSettings = createHook(settingsItem);
```

### Using in Components

```tsx
import { useSettings } from './storage';

function SettingsPanel() {
  const [settings, setSettings] = useSettings();

  if (!settings) {
    return <div>No settings saved</div>;
  }

  return (
    <div>
      <p>Current theme: {settings.theme}</p>
      <button onClick={() => setSettings({ ...settings, theme: 'dark' })}>
        Dark Mode
      </button>
      <button onClick={() => setSettings({ ...settings, theme: 'light' })}>
        Light Mode
      </button>
    </div>
  );
}
```

### Functional Updates

The setter function supports functional updates, similar to React's `useState`:

```tsx
function FontSizeControl() {
  const [settings, setSettings] = useSettings();

  const increaseFontSize = () => {
    setSettings((prev) => {
      if (!prev) return { theme: 'light', fontSize: 14 };
      return { ...prev, fontSize: prev.fontSize + 1 };
    });
  };

  const decreaseFontSize = () => {
    setSettings((prev) => {
      if (!prev) return { theme: 'light', fontSize: 14 };
      return { ...prev, fontSize: Math.max(10, prev.fontSize - 1) };
    });
  };

  return (
    <div>
      <span>Font size: {settings?.fontSize ?? 14}</span>
      <button onClick={decreaseFontSize}>-</button>
      <button onClick={increaseFontSize}>+</button>
    </div>
  );
}
```

### Removing Data

Set value to `null` to remove the item from storage:

```tsx
function ClearSettings() {
  const [settings, setSettings] = useSettings();

  return (
    <button onClick={() => setSettings(null)}>
      Clear Settings
    </button>
  );
}
```

## API

### `createHook<TData>(item: StashItem<TData>)`

Creates a React hook for the given StashItem.

**Parameters:**
- `item` - A StashItem instance from `@wildneo/local-stash`

**Returns:**
A hook function that returns `[value, setValue]` tuple:
- `value: TData | null` - Current stored value or null
- `setValue: Dispatch<SetStateAction<TData | null>>` - Setter function

## Runtime Validation with Zod

Use the `select` option with [zod](https://github.com/colinhacks/zod) for runtime type safety:

```typescript
import { z } from 'zod';
import { createStash, createItem } from '@wildneo/local-stash';
import { createHook } from '@wildneo/react-local-stash';

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
    return result.success ? result.data : { theme: 'light', fontSize: 14 };
  },
});

export const useSettings = createHook(settingsItem);
```

Now the hook always returns validated data or a safe default value.

## Automatic Sync

The hook automatically subscribes to storage changes. If the value is updated elsewhere (e.g., in another component or browser tab), all components using the hook will re-render with the new value.

```tsx
// Both components will stay in sync
function ComponentA() {
  const [settings, setSettings] = useSettings();
  // ...
}

function ComponentB() {
  const [settings] = useSettings();
  // Will update when ComponentA changes settings
}
```

## License

MIT
