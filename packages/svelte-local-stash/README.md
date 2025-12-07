# @wildneo/svelte-local-stash

Svelte store adapter for [@wildneo/local-stash](../local-stash).

## Installation

```bash
npm install @wildneo/local-stash @wildneo/svelte-local-stash
```

## Peer Dependencies

- `svelte` ^4 || ^5
- `@wildneo/local-stash`

## Usage

### Creating a Store

```typescript
// stores.ts
import { createStash, createItem } from '@wildneo/local-stash';
import { createStore } from '@wildneo/svelte-local-stash';

// Create stash and item
const stash = createStash({ storage: localStorage });

type UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
}

const settingsItem = createItem<UserSettings>({
  stash,
  key: 'user-settings',
});

// Create a Svelte store for this item
export const settings = createStore(settingsItem);
```

### Using in Components

```svelte
<script>
  import { settings } from './stores';
</script>

{#if $settings}
  <p>Current theme: {$settings.theme}</p>
  <button on:click={() => settings.set({ ...$settings, theme: 'dark' })}>
    Dark Mode
  </button>
  <button on:click={() => settings.set({ ...$settings, theme: 'light' })}>
    Light Mode
  </button>
{:else}
  <p>No settings saved</p>
{/if}
```

### Functional Updates

Use the `update` method for functional updates:

```svelte
<script>
  import { settings } from './stores';

  function increaseFontSize() {
    settings.update((prev) => {
      if (!prev) return { theme: 'light', fontSize: 14 };
      return { ...prev, fontSize: prev.fontSize + 1 };
    });
  }

  function decreaseFontSize() {
    settings.update((prev) => {
      if (!prev) return { theme: 'light', fontSize: 14 };
      return { ...prev, fontSize: Math.max(10, prev.fontSize - 1) };
    });
  }
</script>

<div>
  <span>Font size: {$settings?.fontSize ?? 14}</span>
  <button on:click={decreaseFontSize}>-</button>
  <button on:click={increaseFontSize}>+</button>
</div>
```

### Removing Data

Set value to `null` to remove the item from storage:

```svelte
<script>
  import { settings } from './stores';
</script>

<button on:click={() => settings.set(null)}>
  Clear Settings
</button>
```

## API

### `createStore<TData>(item: StashItem<TData>): Writable<TData | null>`

Creates a Svelte writable store for the given StashItem.

**Parameters:**
- `item` - A StashItem instance from `@wildneo/local-stash`

**Returns:**
A Svelte `Writable` store with:
- `subscribe(callback)` - Subscribe to value changes
- `set(value)` - Set a new value (or `null` to remove)
- `update(updater)` - Update value using a function

## License

MIT
