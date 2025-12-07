# @wildneo/emitter

A simple event emitter for TypeScript.

## Installation

```bash
npm install @wildneo/emitter
```

## Usage

```typescript
import { EventEmitter } from '@wildneo/emitter';

const emitter = new EventEmitter();

// Subscribe to an event
const listener = (data: string) => {
  console.log('Received:', data);
};

emitter.on('message', listener);

// Emit an event
emitter.emit('message', 'Hello, World!');
// Output: Received: Hello, World!

// Unsubscribe
emitter.off('message', listener);
```

## API

### `new EventEmitter()`

Creates a new EventEmitter instance.

### `on(event: string, listener: Listener): void`

Registers a listener for the specified event.

```typescript
emitter.on('user:login', (user) => {
  console.log('User logged in:', user.name);
});
```

### `off(event: string, listener: Listener): void`

Removes a listener from the specified event.

```typescript
const handler = (data) => console.log(data);

emitter.on('event', handler);
emitter.off('event', handler);
```

### `emit(event: string, ...args: any[]): void`

Emits an event with optional arguments.

```typescript
emitter.emit('notification', { type: 'info', message: 'Hello' });
emitter.emit('count', 1, 2, 3);
```

## Types

```typescript
type Listener = (...args: any[]) => void;
```

## License

MIT
