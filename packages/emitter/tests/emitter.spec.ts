import { expect, test, vi } from 'vitest';
import { EventEmitter } from '../src';

test('should register a listener when on is called', () => {
  const emitter = new EventEmitter();
  const listener = vi.fn();
  emitter.on('testEvent', listener);
  emitter.emit('testEvent');
  
  expect(listener).toBeCalled();
});

test('should not call listener after it is removed', () => {
  const emitter = new EventEmitter();
  const listener = vi.fn();
  emitter.on('testEvent', listener);
  emitter.emit('testEvent');
  emitter.off('testEvent', listener);
  emitter.emit('testEvent');
  
  expect(listener).toBeCalledTimes(1);
});