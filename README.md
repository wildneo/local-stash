# Local Stash

A typed wrapper for working with localStorage and similar synchronous storage APIs in TypeScript. Includes adapters for React and Svelte.

## Packages

| Package | Description |
|---------|-------------|
| [@wildneo/local-stash](./packages/local-stash) | Core library with `Stash` and `StashItem` classes |
| [@wildneo/react-local-stash](./packages/react-local-stash) | React hook adapter |
| [@wildneo/svelte-local-stash](./packages/svelte-local-stash) | Svelte store adapter |
| [@wildneo/emitter](./packages/emitter) | Simple event emitter (internal dependency) |

## Quick Start

```bash
# Install the core package
npm install @wildneo/local-stash

# For React projects
npm install @wildneo/react-local-stash

# For Svelte projects
npm install @wildneo/svelte-local-stash
```

## Basic Usage

```typescript
import { createStash, createItem } from '@wildneo/local-stash';

// Create a stash instance
const stash = createStash({ storage: localStorage });

// Create a typed item
const userSettings = createItem<{ theme: 'light' | 'dark' }>({
  stash,
  key: 'user-settings',
});

// Use it
userSettings.setItem({ theme: 'dark' });
const settings = userSettings.getItem(); // { theme: 'dark' }
```

## License

MIT
