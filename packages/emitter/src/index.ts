import { Listener } from "./types.js";

/**
 * Class representing an event emitter.
 *
 * This class allows registering, removing, and emitting event listeners.
 */
export class EventEmitter {
  #events: Map<string, Listener[]>;

  constructor() {
    this.#events = new Map();
  }

  on(event: string, listener: Listener): void {
    if (!this.#events.has(event)) {
      this.#events.set(event, []);
    }
    this.#events.get(event)!.push(listener);
  }

  off(event: string, listenerToRemove: Listener): void {
    if (!this.#events.has(event)) return;

    const listeners = this.#events.get(event)!;
    const filteredListeners = listeners.filter(
      (listener) => listener !== listenerToRemove
    );

    if (filteredListeners.length > 0) {
      this.#events.set(event, filteredListeners);
    } else {
      this.#events.delete(event);
    }
  }

  emit(event: string, ...args: any[]): void {
    this.#events.get(event)?.forEach((listener) => {
      listener(...args);
    });
  }
}
